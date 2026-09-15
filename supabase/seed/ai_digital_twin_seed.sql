-- Optional seed for Saqib Muhammad's public Portfolio Intelligence view.
-- Run after the AI Digital Twin migration. It is safe to re-run.

insert into public.twin_profiles (owner_id, display_name, headline, personality_prompt, is_public)
select o.user_id,
       'Saqib AI',
       'AI Digital Twin + Portfolio Intelligence',
       'Professional, natural, technically precise, evidence-first, concise by default, and transparent about uncertainty.',
       true
from public.owners o
where not exists (select 1 from public.twin_profiles p where p.owner_id = o.user_id);

insert into public.twin_life_events (owner_id, category, title, summary, importance, evidence, visibility)
select o.user_id, v.category, v.title, v.summary, v.importance, jsonb_build_array(v.evidence), 'public'
from public.owners o
cross join (values
  ('education','BS Artificial Intelligence','Pursuing a BS in Artificial Intelligence at Iqra University, Islamabad Campus, building foundations in programming, machine learning, and applied problem solving.',5,'Current portfolio profile: education section.'),
  ('career','Machine Learning Internship','Completed a machine learning internship at Rhombix Technologies alongside Artificial Intelligence studies.',4,'Current portfolio profile: experience section.'),
  ('career','Ecommerce & Shopify Experience','More than two years of hands-on ecommerce, Shopify website design, and digital marketing experience.',4,'Current portfolio profile: experience and about sections.')
) as v(category,title,summary,importance,evidence)
where not exists (
  select 1 from public.twin_life_events e
  where e.owner_id = o.user_id and e.title = v.title and e.source_id is null
);

insert into public.twin_skill_evidence (owner_id, skill, category, evidence_text, confidence, visibility)
select o.user_id, v.skill, v.category, v.evidence_text, v.confidence, 'public'
from public.owners o
cross join (values
  ('Python','technical','Portfolio profile explicitly lists Python in AI/ML and web-development expertise.',0.90::real),
  ('Machine Learning','ai','Portfolio profile explicitly describes training machine-learning models and a completed ML internship.',0.95::real),
  ('C++','technical','Portfolio profile explicitly lists C++ in the web-development/programming skill set.',0.88::real),
  ('Web Development','technical','Portfolio profile explicitly lists web development as a primary area of work.',0.92::real),
  ('Shopify','ecommerce','Portfolio profile explicitly lists Shopify website design with more than two years of ecommerce experience.',0.95::real),
  ('Ecommerce','ecommerce','Portfolio profile explicitly states more than two years of hands-on ecommerce experience.',0.96::real),
  ('Digital Marketing','business','Portfolio profile explicitly lists digital marketing as part of ecommerce experience.',0.88::real)
) as v(skill,category,evidence_text,confidence)
where not exists (
  select 1 from public.twin_skill_evidence s
  where s.owner_id = o.user_id and lower(s.skill) = lower(v.skill) and s.source_id is null
);
