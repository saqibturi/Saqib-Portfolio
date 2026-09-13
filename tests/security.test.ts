import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  contactSchema,
  csvCell,
  canReadMedia,
  certificateSchema,
  projectSchema,
} from "../lib/validation";
import { emptyProject, emptyCertificate } from "../lib/types";
test("contact validation rejects invalid and oversized submissions", () => {
  const valid = {
    name: "Example Sender",
    email: "example@example.com",
    company: "",
    type: "Project enquiry",
    message: "I would like to discuss a website project.",
    website: "",
    submissionId: crypto.randomUUID(),
  };
  assert.equal(contactSchema.safeParse(valid).success, true);
  assert.equal(
    contactSchema.safeParse({ ...valid, email: "invalid" }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({ ...valid, message: "x".repeat(5001) }).success,
    false,
  );
});
test("CSV cells neutralize spreadsheet formula injection and quote safely", () => {
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell("  +123"), '"\'  +123"');
  assert.equal(csvCell("Normal, text"), '"Normal, text"');
});
test("project validation rejects script URLs and arbitrary asset locations", () => {
  const p = {
    ...emptyProject,
    id: crypto.randomUUID(),
    slug: "sample",
    title: "Sample",
  };
  assert.equal(projectSchema.safeParse(p).success, true);
  assert.equal(
    projectSchema.safeParse({ ...p, github: "javascript:alert(1)" }).success,
    false,
  );
  assert.equal(
    projectSchema.safeParse({ ...p, cover: "https://unknown.example/a.jpg" })
      .success,
    false,
  );
});
test("draft media is not made public by unrelated documents", () => {
  const id = crypto.randomUUID();
  assert.equal(canReadMedia(id, [{ cover: "/portrait.webp" }]), false);
  assert.equal(
    canReadMedia(id, [{ gallery: [{ url: `/api/media/${id}` }] }]),
    true,
  );
});
test("database: RLS, isolated publishing, slug history, rate limit, and message uniqueness", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`,
    );
    await db.exec(
      await readFile("supabase/migrations/001_portfolio.sql", "utf8"),
    );
    const owner = crypto.randomUUID(),
      stranger = crypto.randomUUID(),
      id = crypto.randomUUID();
    await db.query("insert into auth.users values ($1),($2)", [
      owner,
      stranger,
    ]);
    await db.query("insert into owners values ($1)", [owner]);
    const project = {
      ...emptyProject,
      id,
      slug: "original-project",
      title: "Published title",
      summary: "An actual test fixture",
    };
    await db.query("insert into project_drafts(id,content) values($1,$2)", [
      id,
      JSON.stringify(project),
    ]);
    await db.query("select publish_project($1)", [id]);
    await db.query("update project_drafts set content=$1 where id=$2", [
      JSON.stringify({ ...project, title: "Secret unfinished edit" }),
      id,
    ]);
    const result = await db.query<{ content: typeof project }>(
      "select content from published_projects",
    );
    assert.equal(result.rows[0].content.title, "Published title");
    await db.exec("set role anon");
    await assert.rejects(db.query("select * from messages"));
    await assert.rejects(db.query("select * from project_drafts"));
    await assert.rejects(
      db.query(
        "insert into messages(id,name,email,type,message) values(gen_random_uuid(),'a','b','c','d')",
      ),
    );
    await assert.rejects(db.query("select publish_project($1)", [id]));
    assert.equal(
      (await db.query("select * from published_projects")).rows.length,
      1,
    );
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      stranger,
    ]);
    await db.exec("set role authenticated");
    assert.equal(
      (await db.query("select * from project_drafts")).rows.length,
      0,
    );
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      owner,
    ]);
    await db.exec("set role authenticated");
    assert.equal(
      (await db.query("select * from project_drafts")).rows.length,
      1,
    );
    await db.exec("reset role");
    await db.query("update project_drafts set content=$1 where id=$2", [
      JSON.stringify({ ...project, slug: "new-project" }),
      id,
    ]);
    await db.query("select publish_project($1)", [id]);
    assert.equal(
      (await db.query("select * from project_slugs where project_id=$1", [id]))
        .rows.length,
      2,
    );
    const duplicate = { ...project, id: crypto.randomUUID() };
    await db.query("insert into project_drafts values($1,$2,now())", [
      duplicate.id,
      JSON.stringify(duplicate),
    ]);
    await assert.rejects(
      db.query("select publish_project($1)", [duplicate.id]),
    );
    await db.query("delete from published_projects where id=$1", [id]);
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select * from project_slugs")).rows.length,
      0,
    );
    await db.exec("reset role");
    for (let i = 0; i < 5; i++)
      assert.equal(
        (
          await db.query<{ consume_rate_limit: boolean }>(
            "select consume_rate_limit('hash',5)",
          )
        ).rows[0].consume_rate_limit,
        true,
      );
    assert.equal(
      (
        await db.query<{ consume_rate_limit: boolean }>(
          "select consume_rate_limit('hash',5)",
        )
      ).rows[0].consume_rate_limit,
      false,
    );
    const message = crypto.randomUUID();
    await db.query(
      "insert into messages(id,name,email,type,message) values($1,'Sender','sender@example.com','Other','Test content')",
      [message],
    );
    await assert.rejects(
      db.query(
        "insert into messages(id,name,email,type,message) values($1,'Sender','sender@example.com','Other','Test content')",
        [message],
      ),
    );
  } finally {
    await db.close();
  }
});


test('certificate input rejects unsafe links and accepts uploaded files',()=>{
 const c={...emptyCertificate,id:crypto.randomUUID(),title:'Test credential',issuer:'Test issuer',file:'/api/media/'+crypto.randomUUID()};
 assert.equal(certificateSchema.safeParse(c).success,true);
 assert.equal(certificateSchema.safeParse({...c,verificationUrl:'javascript:alert(1)'}).success,false);
 assert.equal(certificateSchema.safeParse({...c,title:''}).success,false);
});

test('certificate migration preserves draft privacy and existing records',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
 await db.exec(await readFile('supabase/migrations/001_portfolio.sql','utf8'));
 await db.query('insert into profile(id,content) values(1,$1)',[JSON.stringify({name:'Existing owner',sections:['about']})]);
 await db.exec(await readFile('supabase/migrations/002_certifications.sql','utf8'));
 await db.exec(await readFile('supabase/migrations/002_certifications.sql','utf8'));
 const profile=(await db.query<{content:{name:string;sections:string[]}}>('select content from profile')).rows[0].content;
 assert.equal(profile.name,'Existing owner');assert.deepEqual(profile.sections,['about','certifications']);
 const id=crypto.randomUUID();const c={...emptyCertificate,id,title:'Original certificate',issuer:'Test issuer'};
 await db.query('insert into certificate_drafts(id,content) values($1,$2)',[id,JSON.stringify(c)]);
 await db.query('insert into published_certificates(id,content) values($1,$2)',[id,JSON.stringify(c)]);
 await db.query('update certificate_drafts set content=$1 where id=$2',[JSON.stringify({...c,title:'Unfinished edit'}),id]);
 await db.exec('set role anon');await assert.rejects(db.query('select * from certificate_drafts'));
 assert.equal((await db.query<{content:{title:string}}>('select content from published_certificates')).rows[0].content.title,'Original certificate');
 await assert.rejects(db.query('delete from published_certificates'));
 await db.exec('reset role');await db.query('delete from published_certificates where id=$1',[id]);assert.equal((await db.query('select * from certificate_drafts')).rows.length,1);
 }finally{await db.close();}
});
