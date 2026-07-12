-- Demo Action Plan artifact for screenshot purposes.
-- Grounded in the real "Toyota Fleet Renewal" deal (Richard Tan) so the SVG
-- chart uses the deal's actual health_* scores. Hand-authored to mirror exactly
-- what buildActionDiagramPrompt() asks the model to produce.
INSERT INTO public.deal_outputs (deal_id, user_id, output_type, format, title, content)
VALUES (
  '53a664f3-2023-47b3-b327-f9fc3c1c94a7',
  'd4e78b49-0aaa-45ee-a3a4-a4d22b89136b',
  'action_diagram',
  'html',
  'Action Plan — Toyota Malaysia',
  $html$<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Action Plan — Toyota Fleet Renewal</title>
<style>
  :root{
    --bg:#0e0d0b; --panel:#17150f; --panel2:#1e1b13; --line:#2c2718;
    --gold:#d9b45a; --gold-bright:#f0cf7a; --ink:#f4efe2; --muted:#9a917c;
    --green:#6cc17e; --amber:#e2b84e; --coral:#e08060;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{
    background:radial-gradient(120% 90% at 50% -10%, #1a1710 0%, var(--bg) 60%);
    color:var(--ink);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    line-height:1.55; padding:48px 20px 80px;
  }
  .wrap{max-width:860px;margin:0 auto}
  .eyebrow{
    font-size:12px;letter-spacing:.22em;text-transform:uppercase;
    color:var(--gold);font-weight:600;margin:0 0 14px
  }
  h1{font-size:34px;line-height:1.15;margin:0 0 8px;font-weight:700;letter-spacing:-.01em}
  .sub{color:var(--muted);font-size:16px;margin:0 0 22px}
  .sub b{color:var(--ink);font-weight:600}
  .read{
    background:linear-gradient(90deg,rgba(217,180,90,.14),rgba(217,180,90,.03));
    border:1px solid rgba(217,180,90,.28);border-left:3px solid var(--gold);
    border-radius:12px;padding:16px 20px;font-size:16px;margin:0 0 40px
  }
  section{margin:0 0 40px}
  .label{
    font-size:12px;letter-spacing:.18em;text-transform:uppercase;
    color:var(--gold);font-weight:600;margin:0 0 16px;display:flex;align-items:center;gap:10px
  }
  .label::before{content:"";width:22px;height:1px;background:var(--gold);opacity:.6}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:24px}
  .chart-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-size:12px;color:var(--muted)}
  .dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:middle}
  svg{width:100%;height:auto;display:block}
  .win{font-size:18px;line-height:1.6}
  .win b{color:var(--gold-bright)}
  .move{display:flex;gap:18px;padding:20px 0;border-top:1px solid var(--line)}
  .move:first-child{border-top:none;padding-top:0}
  .move-n{
    flex:0 0 40px;height:40px;border-radius:12px;background:rgba(217,180,90,.12);
    border:1px solid rgba(217,180,90,.35);color:var(--gold-bright);
    font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center
  }
  .move-body h3{margin:2px 0 6px;font-size:17px}
  .move-body p{margin:0 0 10px;color:#cfc7b3;font-size:15px}
  .chip{
    display:inline-block;font-size:11px;letter-spacing:.04em;font-weight:600;
    color:var(--gold);background:rgba(217,180,90,.1);border:1px solid rgba(217,180,90,.3);
    border-radius:999px;padding:4px 11px
  }
  .tree-obstacle{
    background:rgba(224,128,96,.1);border:1px solid rgba(224,128,96,.35);
    border-radius:12px;padding:16px 20px;font-size:15px;margin-bottom:8px
  }
  .tree-obstacle b{color:var(--coral)}
  .branches{display:grid;gap:12px}
  .branch{display:flex;gap:14px;align-items:flex-start;background:var(--panel2);
    border:1px solid var(--line);border-radius:12px;padding:16px 18px}
  .branch .if{flex:0 0 132px;color:var(--gold-bright);font-weight:600;font-size:14px}
  .branch .then{flex:1;color:#cfc7b3;font-size:15px}
  .branch .arrow{color:var(--muted);flex:0 0 auto;padding-top:1px}
  footer{margin-top:52px;text-align:center;color:var(--muted);font-size:15px;font-style:italic}
  .mark{margin-top:18px;font-style:normal;letter-spacing:.28em;text-transform:uppercase;
    font-size:12px;color:var(--gold);font-weight:600}
  @media(max-width:560px){
    h1{font-size:26px}
    .branch{flex-direction:column;gap:6px}
    .branch .if{flex:none}
  }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">Niles · Deal Strategy Map</p>
  <h1>Toyota Fleet Renewal</h1>
  <p class="sub"><b>Richard Tan</b> · Head of Procurement, Toyota Malaysia · Proposal submitted · USD 250,000</p>
  <div class="read">
    This deal isn't stuck on price or product — you're strong there. It's stuck on <b>trust</b>.
    Richard is an analytical buyer sitting on a decision he has to defend, and right now he
    doesn't yet believe you'll protect him from the downside. Close that one gap and this closes.
  </div>

  <section>
    <p class="label">Principle Strength Map</p>
    <div class="card">
      <svg viewBox="0 0 600 285" role="img" aria-label="Principle strength chart">
        <!-- gridline at 100 -->
        <line x1="180" y1="8" x2="180" y2="277" stroke="#2c2718" stroke-width="1"/>
        <!-- Purpose 72 -->
        <text x="170" y="31" text-anchor="end" fill="#cfc7b3" font-size="13" font-family="sans-serif">Purpose</text>
        <rect x="180" y="15" width="380" height="22" rx="5" fill="#211d14"/>
        <rect x="180" y="15" width="274" height="22" rx="5" fill="#6cc17e"/>
        <text x="565" y="31" fill="#f4efe2" font-size="13" font-family="sans-serif">72</text>
        <!-- Visioning 65 -->
        <text x="170" y="69" text-anchor="end" fill="#cfc7b3" font-size="13" font-family="sans-serif">Visioning</text>
        <rect x="180" y="53" width="380" height="22" rx="5" fill="#211d14"/>
        <rect x="180" y="53" width="247" height="22" rx="5" fill="#e2b84e"/>
        <text x="565" y="69" fill="#f4efe2" font-size="13" font-family="sans-serif">65</text>
        <!-- Knowledge 80 -->
        <text x="170" y="107" text-anchor="end" fill="#cfc7b3" font-size="13" font-family="sans-serif">Knowledge</text>
        <rect x="180" y="91" width="380" height="22" rx="5" fill="#211d14"/>
        <rect x="180" y="91" width="304" height="22" rx="5" fill="#6cc17e"/>
        <text x="565" y="107" fill="#f4efe2" font-size="13" font-family="sans-serif">80</text>
        <!-- Kindness 55 -->
        <text x="170" y="145" text-anchor="end" fill="#cfc7b3" font-size="13" font-family="sans-serif">Kindness</text>
        <rect x="180" y="129" width="380" height="22" rx="5" fill="#211d14"/>
        <rect x="180" y="129" width="209" height="22" rx="5" fill="#e2b84e"/>
        <text x="565" y="145" fill="#f4efe2" font-size="13" font-family="sans-serif">55</text>
        <!-- Leadership 48 -->
        <text x="170" y="183" text-anchor="end" fill="#cfc7b3" font-size="13" font-family="sans-serif">Leadership</text>
        <rect x="180" y="167" width="380" height="22" rx="5" fill="#211d14"/>
        <rect x="180" y="167" width="182" height="22" rx="5" fill="#e08060"/>
        <text x="565" y="183" fill="#f4efe2" font-size="13" font-family="sans-serif">48</text>
        <!-- Trust 40 -->
        <text x="170" y="221" text-anchor="end" fill="#cfc7b3" font-size="13" font-family="sans-serif">Trust</text>
        <rect x="180" y="205" width="380" height="22" rx="5" fill="#211d14"/>
        <rect x="180" y="205" width="152" height="22" rx="5" fill="#e08060"/>
        <text x="565" y="221" fill="#f4efe2" font-size="13" font-family="sans-serif">40</text>
        <!-- Emotional 58 -->
        <text x="170" y="259" text-anchor="end" fill="#cfc7b3" font-size="13" font-family="sans-serif">Emotional</text>
        <rect x="180" y="243" width="380" height="22" rx="5" fill="#211d14"/>
        <rect x="180" y="243" width="220" height="22" rx="5" fill="#e2b84e"/>
        <text x="565" y="259" fill="#f4efe2" font-size="13" font-family="sans-serif">58</text>
      </svg>
      <div class="chart-legend">
        <span><span class="dot" style="background:#6cc17e"></span>Strength (70+)</span>
        <span><span class="dot" style="background:#e2b84e"></span>Building (55–69)</span>
        <span><span class="dot" style="background:#e08060"></span>Gap — your leverage (&lt;55)</span>
        <span style="margin-left:auto;color:#cfc7b3">Overall 59 / 100</span>
      </div>
    </div>
  </section>

  <section>
    <p class="label">Their Personal Win</p>
    <div class="card win">
      Richard's win <b>isn't the lowest price</b> — it's a decision he can defend to his board with
      his name on it. He wants to be the procurement head who <b>de-risked a quarter-million-dollar
      switch with zero production downtime</b>, backed by numbers. Sell to that fear of blame, not to
      the spec sheet.
    </div>
  </section>

  <section>
    <p class="label">Your Next 3 Moves — This Week</p>
    <div class="card">
      <div class="move">
        <div class="move-n">1</div>
        <div class="move-body">
          <h3>Turn his biggest fear into your proof</h3>
          <p>Send a one-page risk-reversal: a phased rollout plan with a written downtime SLA, plus
          a reference call with an automotive client who switched with zero line stoppage. His #1
          objection becomes your strongest evidence.</p>
          <span class="chip">Trust · Ch.6</span>
        </div>
      </div>
      <div class="move">
        <div class="move-n">2</div>
        <div class="move-body">
          <h3>Offer to make him look good to his board</h3>
          <p>Propose co-presenting the transition plan to his internal stakeholders. Position yourself
          as the person who takes the rollout-risk narrative off his plate — a partner, not a vendor.</p>
          <span class="chip">Leadership · Ch.5</span>
        </div>
      </div>
      <div class="move">
        <div class="move-n">3</div>
        <div class="move-body">
          <h3>Ask one human question before the next data review</h3>
          <p>Ask what actually keeps him up at night about this rollout — then tailor the ROI model to
          answer exactly that. Analytical buyers still decide on the fear you remove, not the chart.</p>
          <span class="chip">Kindness · Ch.4</span>
        </div>
      </div>
    </div>
  </section>

  <section>
    <p class="label">If This, Then That</p>
    <div class="tree-obstacle">
      <b>Most likely next obstacle:</b> &ldquo;The switching cost and downtime risk is too high to
      justify right now.&rdquo;
    </div>
    <div class="branches">
      <div class="branch">
        <div class="if">If he stalls on downtime</div>
        <div class="arrow">→</div>
        <div class="then">Lead with the phased-rollout SLA and the zero-stoppage reference call. Make walking away feel like the risky choice, not switching.</div>
      </div>
      <div class="branch">
        <div class="if">If he pushes on price</div>
        <div class="arrow">→</div>
        <div class="then">Reframe from sticker price to 3-year total cost of ownership. His motivation is long-term ROI — put the number in his language: data.</div>
      </div>
      <div class="branch">
        <div class="if">If he goes quiet</div>
        <div class="arrow">→</div>
        <div class="then">Don't send &ldquo;just checking in.&rdquo; Send one new data point — a benchmark or case study — that advances his internal business case for him.</div>
      </div>
    </div>
  </section>

  <footer>
    You're closer than the score says. Trust is the only real gap — and trust is built in a single
    honest conversation. Go have it.
    <div class="mark">Niles</div>
  </footer>
</div>
</body>
</html>$html$
);

INSERT INTO public.deal_activities (deal_id, user_id, activity_type, description)
VALUES (
  '53a664f3-2023-47b3-b327-f9fc3c1c94a7',
  'd4e78b49-0aaa-45ee-a3a4-a4d22b89136b',
  'action_diagram_generated',
  'Action plan generated for Richard Tan'
);
