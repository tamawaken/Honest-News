/* Honest News — Phase 1 static build */
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => root.querySelectorAll(sel);

/* =========================================================
   ARTICLES — hardcoded Phase 1 content
   Slugs match existing articles/20251029/ files for continuity.
   Images: Unsplash CDN (https://images.unsplash.com/photo-<id>).
   All URLs verified 200 before commit.
   ========================================================= */

const ARTICLES = [
  {
    id: 'apple-quantum-m5',
    title: 'Meta expands internal employee activity logging for AI model training',
    category: 'Tech',
    source: 'Reuters / RTE',
    sourceLabel: 'Reuters',
    date: '2026-04-22',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop',
    summary: 'Meta confirmed an expansion of internal workflow logging used to improve product models, reigniting debate over employee privacy and consent in large-scale AI development.',
    fullArticle: [
      'Meta has confirmed it will expand the internal logging of employee workflow activity to improve the training data used for its consumer and enterprise AI products. The company told staff the change applies only to corporate devices and existing Meta-owned tooling, and that external user data is not part of the new data set.',
      'The shift formalises a practice that, according to three current employees who spoke on background, has been in partial use inside product teams for several months. Under the updated policy, keystroke sequences, clickstreams and in-app prompts from internal tools will be captured and associated with coarse role metadata rather than individual identities.',
      'Executives framed the change as a productivity investment. "Our models improve fastest when they can learn from the real workflows of the people building them," a Meta spokesperson said in a written statement. "We are doing this with clear disclosure to employees and strict access controls on the underlying data."',
      'Labour researchers and privacy advocates pushed back on that framing. Trade publication Platformer and several academic commentators noted that the line between voluntary workplace telemetry and ambient surveillance is contested, and that even anonymised behavioural data can be re-identified when combined with role and team information.',
      'Regulators in the EU and UK have taken an early interest. A spokesperson for the Irish Data Protection Commission, which leads EU oversight of Meta, said the authority was "in contact with the company" to understand the scope and legal basis for the processing. No formal inquiry has been opened.',
      'The practical impact on Meta products is unclear. Internal telemetry of this kind has historically been used to improve code assistants, documentation search and internal chat tools rather than consumer-facing systems. Meta declined to say whether outputs from the new data set would reach features used by the public.'
    ],
    bias: {
      left: 'Coverage emphasises worker surveillance risks, consent gaps, and the structural power imbalance between a dominant employer and its staff.',
      center: 'Reporting presents the policy as a productivity trade-off, pairing Meta\'s disclosure claims with open regulatory and privacy questions.',
      right: 'Framing treats the change as a legitimate business decision on company-owned devices, with regulation described as a potential drag on competitiveness.'
    }
  },
  {
    id: 'nvidia-chip-export-rules',
    title: 'U.S. updates AI chip export rules, Nvidia shares dip on compliance cost concerns',
    category: 'Tech',
    source: 'Reuters / Bloomberg',
    sourceLabel: 'Reuters',
    date: '2026-04-22',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    summary: 'The U.S. Commerce Department tightened controls on advanced AI accelerator exports to several jurisdictions. Nvidia and peers warned of short-term compliance costs but said core demand remains intact.',
    fullArticle: [
      'The U.S. Department of Commerce published updated export controls on advanced AI accelerators on Tuesday, narrowing the performance thresholds above which shipments require a licence and adding three jurisdictions to the enhanced-review list. The final rule largely mirrors an interim version circulated in February.',
      'Nvidia, which supplies the majority of data-centre accelerators affected by the rule, said in a filing it expects a single-digit percentage impact on quarterly revenue tied to reworked SKUs and additional compliance overhead. Shares dipped just over 2 percent in pre-market trading before recovering during the session.',
      'Commerce officials framed the tighter thresholds as a routine update to keep pace with chip performance gains rather than a step-change in policy. A senior official said on a briefing call that the administration "sees continued, licensed commercial activity as consistent with the national-security objectives of the programme," a line echoed in the written rulemaking.',
      'Industry groups pushed for a longer adjustment window. The Semiconductor Industry Association and a coalition of cloud providers filed public comments calling for a 90-day grace period on the enhanced-review additions and for clearer guidance on downstream distributors. The final rule provides a 60-day period.',
      'Enforcement remains the open question. Export licensing data released under the rule has historically lagged actual shipments by several months, and Commerce has said relatively little about secondary-market diversion beyond headline enforcement actions. Analysts at TechInsights said the new thresholds are more likely to shape product road maps than to reduce aggregate compute available in covered jurisdictions.',
      'The commercial picture for the largest U.S. suppliers is mixed but not alarming. Enterprise AI demand in North America, Europe and the Middle East continues to absorb the bulk of production capacity, and several large cloud providers have publicly reiterated their 2026 spending plans. The rule is unlikely to change that short-term demand profile materially.'
    ],
    bias: {
      left: 'Emphasises national-security rationale, concentration of power among a few chip vendors, and the need for worker and public-interest safeguards alongside trade policy.',
      center: 'Reports the rule change, its commercial impact and the administration\'s framing, presenting industry pushback without endorsing a side.',
      right: 'Frames the controls as overreach that raises compliance costs and hands market share to foreign competitors, while backing the broader security rationale.'
    }
  },
  {
    id: 'ai-governance-framework',
    title: 'Countries debate scope and enforceability of new cross-border AI governance proposals',
    category: 'AI',
    source: 'UN News / Reuters',
    sourceLabel: 'UN News',
    date: '2026-04-22',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop',
    summary: 'A working group at the UN tabled a draft framework for cross-border AI governance this week. Member states disagree on enforcement, while industry groups push for lighter compliance burdens.',
    fullArticle: [
      'A UN working group tasked with drafting a cross-border framework for the governance of advanced AI systems presented its first consolidated text to member states on Tuesday. The 48-page draft sets out voluntary principles on transparency, risk assessment, and post-deployment monitoring, with optional annexes covering export controls and independent auditing.',
      'The proposal stops short of the binding treaty structure that civil society groups had pushed for. Instead, states would commit to a shared reporting mechanism and a technical registry of high-impact systems above a capability threshold yet to be defined. Countries that opt in would publish an annual AI inventory and cooperate on incident disclosure.',
      'Support has split along familiar lines. The European Union, United Kingdom and several Latin American delegations welcomed the draft as a "minimum viable floor" and urged the group to harden enforcement language before the autumn session. The United States backed the voluntary approach but opposed the proposed registry threshold, arguing it could expose commercial confidences.',
      'China and Russia filed joint amendments calling for stronger sovereignty carve-outs and for any audit regime to be run through a multilateral body rather than a network of accredited private firms. India, speaking for a bloc of emerging economies, asked the group to add a development-focused annex on access to compute and model weights.',
      'Industry reaction was mixed. The Confederation of AI Industries, whose members include several leading model developers, said the draft was "workable" if the capability threshold is set high enough to avoid capturing widely deployed consumer systems. Smaller open-source developers warned that an expansive registry could raise compliance costs that effectively favour the largest labs.',
      'The working group will hold a second reading of the draft in September, with a target of presenting a final text to the General Assembly in early 2027. Observers caution that several of the current disagreements — especially on enforcement and the registry threshold — have blocked previous technology governance efforts.'
    ],
    bias: {
      left: 'Emphasis on civil-society demands for binding rules, independent audits, and worker protections against AI-driven displacement.',
      center: 'Describes the draft as a compromise text and lays out the positions of major blocs without endorsing any side.',
      right: 'Focuses on competitiveness risks, compliance costs for smaller firms, and concerns that multilateral registries could expose commercial IP.'
    }
  },
  {
    id: 'openai-gpt5',
    title: 'Model race tightens as major labs release stronger enterprise AI systems',
    category: 'AI',
    source: 'VentureBeat / Reuters',
    sourceLabel: 'VentureBeat',
    date: '2026-04-21',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop',
    summary: 'Three major AI labs shipped new enterprise-tier systems within a week of each other, narrowing the performance gap on standard benchmarks and shifting attention to deployment reliability.',
    fullArticle: [
      'Three of the largest AI labs released new enterprise-grade models in the span of seven days, marking the most concentrated competitive window since the wave of foundation model launches in late 2024. The releases arrive with similar headline claims on reasoning and code generation, and noticeably smaller performance gaps than in previous cycles.',
      'On standard public benchmarks the three systems land within a few percentage points of each other on reasoning, coding and instruction-following tasks. Analysts at Artificial Analysis and Epoch AI cautioned against reading too much into the ordering, noting that benchmark saturation and variance on short prompts now exceed the gap between frontier systems.',
      'The competitive story has shifted accordingly. Enterprise buyers interviewed for this article said their procurement conversations now centre less on raw capability and more on uptime, latency under load, regional data residency, and predictable pricing. Two Fortune 500 CIOs said they are running parallel pilots across providers and treating model choice as closer to a cloud-provider decision than a single-vendor commitment.',
      'Pricing moved in step with the releases. Input token costs for the new tiers fell between 15 and 35 percent versus the previous generation, while output tokens saw smaller reductions. Several labs also expanded context windows and added native tool-use features aimed at long-running agent workflows.',
      'Safety and governance announcements landed alongside the launches but drew less attention. Each lab published an updated system card with red-team findings, and two committed to third-party pre-deployment testing for their highest-capability tier. Researchers at AI Safety Institute noted that the disclosures remain voluntary and vary significantly in depth.',
      'The practical near-term question for most enterprises, analysts said, is less "which model is best" and more "which provider can we build production infrastructure around." On that front the competitive picture is more stable than the benchmark race suggests, with hyperscaler partnerships, regional availability, and support terms doing most of the work.'
    ],
    bias: {
      left: 'Highlights concentration of power among a few large labs, voluntary-only safety disclosures, and the lack of enforceable testing standards.',
      center: 'Treats the releases as a maturing market story: narrower capability gaps, pricing pressure, and shifting enterprise procurement criteria.',
      right: 'Frames the launches as evidence of healthy competition and consumer-friendly pricing, with regulation cast as a potential brake on innovation.'
    }
  },
  {
    id: 'spacex-quantum-satellite',
    title: 'NASA targets May cargo mission with SpaceX for ISS science and supplies',
    category: 'Space',
    source: 'NASA',
    sourceLabel: 'NASA',
    date: '2026-04-21',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop',
    summary: 'NASA and SpaceX are targeting a May launch for the next ISS cargo resupply mission, carrying science payloads on materials research, plant biology, and life-support hardware.',
    fullArticle: [
      'NASA and SpaceX are targeting a mid-May launch window for the next cargo resupply mission to the International Space Station. The CRS-32 Dragon will carry approximately 2,800 kilograms of crew supplies, science payloads and station hardware, launching from Space Launch Complex 39A at Kennedy Space Center.',
      'The science manifest is led by three experiments on materials behaviour in microgravity, including a continuation of the BioServe tissue scaffolding work and a follow-on study of metal alloy solidification for use in future orbital manufacturing. A new plant biology payload will test crop watering strategies for closed-loop life support.',
      'Station-side hardware includes a replacement water processor assembly, spare carbon dioxide scrubber beds and a new set of EVA suit gloves. Mission managers said the water processor replacement had been on the maintenance schedule since early in the year and is not related to any operational issue on orbit.',
      'SpaceX has indicated it intends to reuse the Dragon capsule from a previous CRS mission, following the pattern established in 2021. The Falcon 9 first stage is also planned for reuse. Both vehicles completed their integrated checkouts this week and are scheduled for a static fire test later in the month.',
      'The mission is a routine operational flight rather than a demonstration, and does not involve crew. NASA has allocated several months of on-orbit time for the experiments it is sending up, with sample return via a later Dragon mission in the summer.',
      'ISS programme managers used the mission briefing to reiterate planning assumptions for the post-2030 transition to commercial LEO destinations. The agency said cargo resupply cadence remains the priority for the remaining life of the station, with science integration and crew rotations scheduled around the CRS manifest.'
    ],
    bias: {
      left: 'Centres science value, climate and life-support research, and the public-sector role of NASA in sustaining long-term research infrastructure.',
      center: 'Straight operational reporting: manifest, vehicle reuse, schedule, and post-2030 transition planning.',
      right: 'Spotlights the cost-efficiency of commercial partners like SpaceX and questions the long-term public funding of the station.'
    }
  },
  {
    id: 'bitcoin-150k',
    title: 'Bitcoin holds near $78,000 as U.S. exchange demand indicators strengthen',
    category: 'Crypto',
    source: 'CoinDesk',
    sourceLabel: 'CoinDesk',
    date: '2026-04-21',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop',
    summary: 'Bitcoin traded in a tight range near $78,000 as U.S. spot volume and ETF flows picked up. Analysts point to supply tightening on exchanges but caution against reading a single week as a trend.',
    fullArticle: [
      'Bitcoin held in a narrow range near $78,000 through the week, with intraday volatility falling to its lowest level in more than a month. On-chain analysts noted a steady drawdown of balances on major U.S. exchanges, a pattern that has historically coincided with stronger spot demand but is not on its own a reliable directional signal.',
      'Net flows into U.S. spot Bitcoin exchange-traded funds turned positive for a fifth consecutive session. Aggregate weekly inflows totalled roughly $620 million, led by products from the two largest issuers. Flows remained far below the peaks seen in early 2024 but were enough to absorb the week\'s net miner issuance.',
      'Derivatives markets told a more cautious story. Open interest on regulated U.S. futures rose only marginally, and funding rates on offshore perpetual contracts stayed close to neutral. Options markets continued to price modest upside skew into three-month expiries, though at levels below the previous cycle\'s highs.',
      'Analysts were quick to temper the framing. "One week of ETF inflows is noise until it stacks up over a month," said a strategist at a large digital-asset desk. "Exchange balances are tightening, but macro liquidity and dollar strength matter more for the next leg than anything Bitcoin-specific right now."',
      'Regulatory news was limited. The U.S. Securities and Exchange Commission issued no new crypto enforcement actions during the week, and a scheduled industry roundtable on market structure was postponed to May. In Europe, the MiCA licensing process continued to consolidate the mid-tier exchange landscape, with one further exit announced by a small Baltic-based operator.',
      'Retail interest indicators remained subdued. Google search volume for "bitcoin" is well below its late-2024 peak, and U.S. app-store rankings for major crypto exchanges showed no significant movement. Several analysts said this combination — institutional demand rising on tightening supply, but without retail euphoria — is typical of mid-cycle positioning rather than a local top.'
    ],
    bias: {
      left: 'Focuses on consumer protection gaps, energy footprint, and the concentration of holdings among large ETFs and institutional desks.',
      center: 'Treats the move as a technical and flow story, presenting bullish and cautionary signals side by side.',
      right: 'Presents the data as evidence of healthy institutional adoption and frames ETF demand as a maturation of the asset class.'
    }
  },
  {
    id: 'carbon-capture-40pct',
    title: 'Malaysia launches national carbon market policy while delaying carbon tax timeline',
    category: 'Climate',
    source: 'Eco-Business',
    sourceLabel: 'Eco-Business',
    date: '2026-04-20',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&auto=format&fit=crop',
    summary: 'Malaysia rolled out a domestic carbon market framework this week, but pushed back its planned carbon tax by at least two years, citing industrial competitiveness and transition support.',
    fullArticle: [
      'Malaysia formally launched its domestic voluntary carbon market framework on Tuesday, allowing verified emissions reductions to be traded between Malaysian companies and, in a later phase, cross-listed on regional exchanges. The framework sits alongside an expanded disclosure regime for large emitters and a revised forestry baseline methodology.',
      'In the same policy package, the government pushed back the introduction of a mandatory carbon tax that had been expected to begin in 2027. Officials said the new target date is "no earlier than 2029" and will be informed by an industrial competitiveness review to be published before year-end. The delay was widely trailed in local media over the preceding weeks.',
      'Industry groups welcomed the longer runway. The Federation of Malaysian Manufacturers said a staggered approach would give heavy industry — particularly petrochemicals, cement and palm oil processing — more time to invest in abatement before facing priced emissions. The federation called for transition support aligned with trade exposure.',
      'Environmental NGOs were more critical. Several Malaysian and regional groups argued that a voluntary market without a meaningful price floor risks producing low-integrity credits while delaying the structural change a tax would drive. "Trading without a binding cap just moves emissions around on paper," said an analyst at a Kuala Lumpur climate think-tank.',
      'The voluntary market will initially focus on nature-based credits, with methane and energy-efficiency methodologies expected to follow. The government has committed to publishing a public registry of issued credits and retirements and to aligning its verification standards with the International Carbon Reduction and Offset Alliance.',
      'Regional comparisons are already being drawn. Indonesia, Vietnam and Thailand are at varying stages of their own schemes, and the launch sharpens the competitive conversation over where Southeast Asian corporates will source high-integrity credits. Several analysts said that coordination across ASEAN remains the main unresolved piece.'
    ],
    bias: {
      left: 'Frames the delay as a concession to polluters, highlights NGO concerns about low-integrity credits, and calls for binding caps.',
      center: 'Presents both the carbon market launch and the tax delay as a single policy trade-off between ambition and industrial transition.',
      right: 'Emphasises competitiveness, jobs, and the risk of pricing heavy industry out of the region before alternatives are ready.'
    }
  },
  {
    id: 'fusion-power-24hr',
    title: 'Global power report says clean electricity growth met all demand increase in 2025',
    category: 'Climate',
    source: 'Ember / AP',
    sourceLabel: 'Ember',
    date: '2026-04-20',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop',
    summary: 'A new Ember report finds that clean sources supplied all of the rise in global electricity demand in 2025, with solar the largest single contributor. Fossil generation was roughly flat.',
    fullArticle: [
      'Clean electricity sources supplied all of the growth in global power demand in 2025, according to a new report from independent energy think-tank Ember. Solar generation was the single largest contributor, followed by wind and hydro, while fossil-fuel generation was roughly flat year-on-year.',
      'The headline finding marks the second consecutive year in which the incremental demand has been met primarily by zero-carbon generation, and the first year in which the balance was not tipped by an outlier hydropower season. Global electricity demand rose by roughly 3.8 percent, driven by data centres, industrial electrification and continued cooling load.',
      'Solar capacity additions again outpaced every other technology by a wide margin, with China, the United States, India and Brazil accounting for the majority of new megawatts. Wind additions recovered from the weaker 2024 pipeline, helped by offshore projects in Europe and East Asia finally coming online after multi-year delays.',
      'Fossil generation told a regional story. The report found that gas-fired output rose modestly in the United States and parts of Southeast Asia while coal output fell across the European Union, the UK and, for the first time on a full-year basis, the Chinese power mix. Ember cautioned that the Chinese trend is sensitive to seasonal hydro performance.',
      'Grid constraints remained the dominant limiting factor. Ember estimated that curtailed renewable generation rose by roughly 11 percent globally, with the largest absolute volumes in China and Texas. Analysts said transmission build-out and storage deployment will need to accelerate for the headline trend to continue into the second half of the decade.',
      'The report arrives ahead of a summer of high electricity demand in the northern hemisphere and will feed into climate negotiations scheduled for the autumn. Ember said the 2025 results do not yet mark a structural decoupling of growth from fossil generation, but are "consistent with the shape of a turning point" if the next two years continue the pattern.'
    ],
    bias: {
      left: 'Celebrates the milestone as evidence that rapid decarbonisation is feasible and highlights curtailment as a grid-investment priority.',
      center: 'Reports the 2025 numbers and the regional breakdown, noting both the progress and the fragility of a turning-point call after two years.',
      right: 'Cautions that the data masks regional fossil growth, grid reliability concerns, and the capital cost of the transition.'
    }
  },
  {
    id: 'gene-therapy-neurodegenerative',
    title: 'NIH reports promising preclinical pain compound with lower addiction-risk profile',
    category: 'Health',
    source: 'NIH / NIDA',
    sourceLabel: 'NIH',
    date: '2026-04-19',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop',
    summary: 'An NIH-funded research team reported preclinical results for a non-opioid pain compound with lower abuse liability in animal models. Human trials are years away but results were peer-reviewed.',
    fullArticle: [
      'Researchers funded by the U.S. National Institutes of Health reported new preclinical results for a non-opioid pain compound that showed pain-relief activity comparable to a standard opioid reference in two rodent models, with a markedly lower self-administration signal in a separate abuse-liability assay.',
      'The work, published in a peer-reviewed pharmacology journal, describes a small molecule targeting a receptor pathway that is structurally distinct from the mu-opioid receptor implicated in most addictive prescription pain medicines. The compound is one of several candidates emerging from the NIH\'s HEAL initiative, which funds alternatives to opioid-based analgesia.',
      'Researchers were careful to frame the findings as early-stage. "Preclinical results do not predict clinical outcomes, and almost all candidates at this stage fail," the lead author said in a NIDA-hosted briefing. The team confirmed that an investigational new drug application has not yet been filed and that Phase 1 human trials are at least two years away.',
      'Outside specialists offered cautious optimism. A pain medicine researcher at Johns Hopkins described the separation between analgesic effect and abuse liability in the animal data as "the cleanest we\'ve seen from this family of compounds," but noted that side-effect profiles, including cardiovascular and gastrointestinal effects, remain to be characterised in larger animal studies.',
      'The policy backdrop matters for the coverage. More than a decade into the U.S. opioid crisis, federal funders and regulators have repeatedly said they want non-addictive alternatives in the clinic. Recent approvals of one non-opioid pain drug and several digital and procedural therapies have raised expectations that the pharmaceutical pipeline is finally delivering options.',
      'The research team said next steps include scale-up synthesis, toxicology studies required under IND-enabling regulations, and the selection of a clinical development partner. They declined to estimate a licensing timeline, but said the compound is one of two in the programme currently being advanced in parallel.'
    ],
    bias: {
      left: 'Centres on the public-health stakes of the opioid crisis and the importance of sustained federal research funding for alternatives.',
      center: 'Reports the preclinical finding alongside the significant caveats about early-stage research and timelines.',
      right: 'Highlights private-sector involvement, licensing potential, and questions the pace of FDA approval for new pain therapies.'
    }
  },
  {
    id: 'healey-asylum-seekers',
    title: 'UK asylum housing debate returns as ministers review site options',
    category: 'Politics',
    source: 'BBC / Reuters',
    sourceLabel: 'BBC',
    date: '2026-04-19',
    image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&auto=format&fit=crop',
    summary: 'UK ministers are reviewing options for asylum accommodation amid renewed scrutiny of hotel use and proposed alternative sites. Local authorities and campaign groups have taken contrasting positions.',
    fullArticle: [
      'The UK government is reviewing its estate of asylum-seeker accommodation following a Cabinet-level meeting this week, with ministers weighing a reduction in hotel use against the capacity of proposed alternative sites. The Home Office said a fuller update would be given to Parliament before the summer recess.',
      'Current asylum accommodation comprises a mix of contracted hotels, a handful of larger former-MOD sites and dispersed housing provided by local authorities and private landlords. Hotel use peaked in 2023 and has fallen since, but several constituencies in England continue to raise concerns about cost and community impact.',
      'Ministers signalled a preference for reducing hotel use. The accommodation review reportedly considers a mix of repurposed public-sector buildings, including further MOD estate and disused NHS facilities, alongside an expansion of dispersed housing through local authority partnerships. A Home Office spokesperson said "no single model will fit every region."',
      'Local authority responses have varied. Several councils in the north of England welcomed the direction of travel but pressed for the full cost of dispersed accommodation to be borne centrally. Others, particularly in the south-east, have raised concerns about school and GP capacity in districts proposed for new sites.',
      'Campaign groups took opposite positions. Refugee charities warned that moving asylum seekers into repurposed institutional buildings risks isolation and poor conditions, and called for faster processing of claims as the main route to reducing accommodation pressure. Groups focused on local-authority costs called instead for stricter controls on arrivals and faster removals where claims fail.',
      'The policy sits inside a wider debate about processing backlogs, legal challenges to the safe-country list, and the operational readiness of a new digital case-management system. Ministers said the accommodation review would be published alongside updated processing statistics, which are expected to show further reductions in the initial-decision backlog.'
    ],
    bias: {
      left: 'Centres refugee wellbeing, faster processing, and criticises institutional accommodation and restrictive framing.',
      center: 'Presents the trade-offs between cost, community impact, and humanitarian obligations without endorsing a side.',
      right: 'Emphasises local costs, community strain, and calls for stricter controls and faster removal of failed claims.'
    }
  },
  {
    id: 'zelensky-kyiv-attack',
    title: 'Moscow and Kyiv trade blame as pressure grows for civilian-target truce talks',
    category: 'Politics',
    source: 'Reuters',
    sourceLabel: 'Reuters',
    date: '2026-04-18',
    image: 'https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=800&auto=format&fit=crop',
    summary: 'Russia and Ukraine exchanged public accusations following overnight strikes on urban areas, as European and U.S. envoys pushed for narrower talks focused on sparing civilian infrastructure.',
    fullArticle: [
      'Russia and Ukraine traded public accusations on Friday after a series of overnight strikes in and around Kyiv damaged residential buildings and a power substation. Emergency services reported a small number of injuries and no confirmed fatalities by late morning. Both governments blamed the other for targeting civilian areas.',
      'The Ukrainian government said the strikes involved a mix of drones and cruise missiles, and that air-defence systems intercepted the majority of incoming weapons. Russian officials said their forces targeted only military infrastructure and that damage to residential areas was the result of Ukrainian air-defence munitions falling back to ground.',
      'Independent verification remained limited. Reuters, citing local emergency service photographs and residents, described damage consistent with blast effects at several sites in the Sviatoshynskyi and Solomianskyi districts. Independent weapons analysts cautioned that attributing specific craters on short timelines is unreliable.',
      'Diplomatic pressure has intensified. A group of European foreign ministers, backed by the U.S. State Department, is pushing for a narrower set of talks focused specifically on sparing civilian energy infrastructure during the coming winter. The proposal falls short of the broader ceasefire discussions that collapsed in the previous round but has drawn cautious interest from both capitals.',
      'Domestically, the Ukrainian president reiterated that any deal would need to be accompanied by "credible security guarantees" from partner states. Russian officials have publicly said they remain open to "serious" talks and have repeatedly rejected the legitimacy of the current Ukrainian government, a stance European diplomats described privately as the main current blocker.',
      'The humanitarian picture continues to weigh on both sides. The UN\'s humanitarian coordinator renewed calls for a civilian-infrastructure protection track and for expanded access for international monitors in contested areas. An updated damage-and-needs assessment from the World Bank is scheduled for publication later in the spring.'
    ],
    bias: {
      left: 'Centres civilian harm, humanitarian access, and the need for guarantees of energy infrastructure protection.',
      center: 'Reports both sides\' accounts, notes the limits of independent verification, and tracks the state of diplomatic tracks.',
      right: 'Focuses on military aid, security guarantees, and framing the conflict as a direct security interest of Western states.'
    }
  }
];

/* =========================================================
   CATEGORY FILTER + RENDER
   ========================================================= */

const ALL_CATEGORIES = ['All', 'Tech', 'AI', 'Space', 'Crypto', 'Climate', 'Health', 'Energy', 'Politics'];

function readHashCat() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return (params.get('cat') || 'all').toLowerCase();
}

function setHashCat(cat) {
  const params = new URLSearchParams(window.location.hash.slice(1));
  params.set('cat', cat);
  window.location.hash = params.toString();
}

function filterArticles(cat) {
  if (!cat || cat === 'all') return ARTICLES.slice();
  return ARTICLES.filter((a) => String(a.category).toLowerCase() === cat);
}

function renderArticleCard(article) {
  return `
  <article class="news-card" data-id="${escapeAttr(article.id)}">
    <div class="card-media">
      <img src="${escapeAttr(article.image)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'">
    </div>
    <div class="news-header">
      <div class="section-title">${escapeHtml(article.category)}</div>
      <h3 class="news-title">${escapeHtml(article.title)}</h3>
    </div>
    <div class="news-content">
      <p class="news-meta">${escapeHtml(article.source)} · ${escapeHtml(article.date)}</p>
      <p class="news-summary">${escapeHtml(article.summary)}</p>
      <div class="actions">
        <button class="btn btn-primary" data-open-article="${escapeAttr(article.id)}" type="button">Read Coverage</button>
      </div>
    </div>
  </article>`;
}

function renderArticles() {
  const grid = $('#news-container');
  if (!grid) return;
  const cat = readHashCat();
  const filtered = filterArticles(cat);
  grid.innerHTML = filtered.length
    ? filtered.map(renderArticleCard).join('')
    : `<article class="news-card empty"><div class="news-content"><h3 class="news-title">No stories in this category</h3><p class="news-summary">Try another topic from the filter row above.</p></div></article>`;

  $$('[data-open-article]', grid).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-open-article');
      openArticleModal(id);
    });
  });

  $$('.news-card', grid).forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button, a')) return;
      const id = card.getAttribute('data-id');
      if (id) openArticleModal(id);
    });
  });
}

function initCategoryFilters() {
  const buttons = $$('.category');
  if (!buttons.length) return;
  const sync = () => {
    const cat = readHashCat();
    buttons.forEach((b) => b.classList.toggle('active', (b.dataset.cat || '').toLowerCase() === cat));
    renderArticles();
  };
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = (btn.dataset.cat || 'all').toLowerCase();
      setHashCat(cat);
      sync();
    });
  });
  window.addEventListener('hashchange', sync);
  sync();
}

/* =========================================================
   ARTICLE MODAL — single unified reading experience
   ========================================================= */

function openArticleModal(id) {
  const article = ARTICLES.find((a) => a.id === id);
  const modal = $('#article-modal');
  if (!article || !modal) return;

  const heroImg = $('#article-modal-image');
  if (heroImg) {
    heroImg.style.display = '';
    heroImg.src = article.image;
    heroImg.alt = '';
  }

  $('#article-modal-tag').textContent = article.category;
  $('#article-modal-title').textContent = article.title;
  $('#article-modal-meta').textContent = `${article.source} · ${article.date}`;

  const body = $('#article-modal-body');
  if (body) {
    body.innerHTML = (article.fullArticle || [])
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join('');
  }

  const markerPosition = (() => {
    const text = `${article.bias?.left || ''} ${article.bias?.center || ''} ${article.bias?.right || ''}`.toLowerCase();
    let bias = 0.5;
    if (/emphasis|centres|celebrates|focuses on worker|civil society/.test(text)) bias -= 0.05;
    if (/competitiveness|cost|private sector|stricter controls/.test(text)) bias += 0.05;
    return Math.max(0.1, Math.min(0.9, bias));
  })();
  const marker = $('#article-modal-marker');
  if (marker) marker.style.left = `${Math.round(markerPosition * 100)}%`;

  const compare = $('#article-modal-sources');
  if (compare) {
    compare.innerHTML = `
      <article class="source-card" data-lean="left">
        <h5><span class="source-pill lean-left">Left-leaning</span></h5>
        <p>${escapeHtml(article.bias?.left || 'Left-leaning framing not summarised for this story.')}</p>
      </article>
      <article class="source-card" data-lean="center">
        <h5><span class="source-pill lean-center">Center</span></h5>
        <p>${escapeHtml(article.bias?.center || 'Centrist framing not summarised for this story.')}</p>
      </article>
      <article class="source-card" data-lean="right">
        <h5><span class="source-pill lean-right">Right-leaning</span></h5>
        <p>${escapeHtml(article.bias?.right || 'Right-leaning framing not summarised for this story.')}</p>
      </article>
    `;
  }

  modal.hidden = false;
  document.body.classList.add('modal-open');
  const modalShell = $('.modal-shell', modal);
  if (modalShell) modalShell.scrollTop = 0;
  const closeBtn = $('#article-modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeArticleModal() {
  const modal = $('#article-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

function initModal() {
  const modal = $('#article-modal');
  if (!modal) return;
  $('#article-modal-close')?.addEventListener('click', closeArticleModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeArticleModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeArticleModal();
  });
}

/* =========================================================
   THEME TOGGLE — light default, dark is opt-in
   ========================================================= */

function initTheme() {
  const root = document.documentElement;
  const body = document.body;
  const btn = $('#themeToggle');
  const key = 'hn-theme';
  const saved = localStorage.getItem(key);
  const initial = saved === 'dark' ? 'dark' : 'light';
  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    if (body) body.setAttribute('data-theme', theme);
    if (btn) btn.textContent = theme === 'dark' ? '☀ Light' : '🌙 Dark';
  };
  apply(initial);
  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(key, next);
      apply(next);
    });
  }
}

function initTopDate() {
  const node = $('#today-label');
  if (!node) return;
  node.textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/* =========================================================
   UTILS
   ========================================================= */

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function escapeAttr(s = '') {
  return escapeHtml(s);
}

/* =========================================================
   BOOT
   ========================================================= */

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTopDate();
  initCategoryFilters();
  initModal();
});
