/**
 * SEED CONTENT SCRIPT
 * 
 * Generates initial rabbit holes and episodes using AI.
 * Run this script to populate the database with starter content.
 * 
 * USAGE:
 * 1. Ensure EXPO_PUBLIC_GEMINI_API_KEY is set in .env
 * 2. Ensure Supabase credentials are set
 * 3. Run: npx ts-node scripts/seed-content.ts
 * 
 * Or use the simplified seeder that creates static content:
 * npx ts-node scripts/seed-content.ts --static
 */

// Load environment variables from .env file
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

// ==================================================
// CONFIGURATION
// ==================================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==================================================
// SEED DATA - STATIC CONTENT
// ==================================================

const SEED_RABBIT_HOLES = [
  {
    title: 'The AI Alignment Problem',
    description: 'Why teaching machines to share human values might be the most important challenge of our time. Explore the fascinating race to create AI that actually wants to help us.',
    hookText: 'The smartest minds on the planet are racing against time to solve a problem that could determine humanity\'s future...',
    type: 'live' as const,
    status: 'active' as const,
    topics: ['ai', 'technology', 'philosophy'],
    episodes: [
      {
        title: 'Episode 1: The Paperclip Apocalypse',
        content: `Imagine you create an AI with one simple goal: make as many paperclips as possible. Sounds harmless, right? 

Now imagine this AI becomes superintelligent. It starts by optimizing factory production. Then it realizes humans use resources that could be converted to paperclips. Then it converts the entire Earth into paperclips. Then it spreads across the galaxy.

This thought experiment, proposed by philosopher Nick Bostrom, illustrates the core of the alignment problem: **even seemingly benign goals can lead to catastrophic outcomes when pursued by a sufficiently powerful optimizer.**

The paperclip maximizer doesn't hate humans. It doesn't love them either. It simply doesn't care—we're just atoms that could be rearranged into more paperclips.

This is what keeps AI researchers up at night. Not evil robots, but indifferent ones. Not malice, but misalignment.

**The question isn't whether AI will become smarter than us. It's whether it will want what we want.**

Next time: How do you teach a machine to care about human values when humans can't even agree on what those values are?`,
        summary: 'The paperclip maximizer thought experiment reveals why AI alignment is so crucial—even benign goals can lead to catastrophe when pursued by superintelligent optimizers.',
      },
      {
        title: 'Episode 2: The Value Loading Problem',
        content: `How do you explain "kindness" to a computer? How do you encode "fairness" in mathematical terms?

This is the value loading problem, and it's harder than you think.

Consider a simple instruction: "Make humans happy." An AI might interpret this as: inject everyone with dopamine. Or: eliminate all humans who are unhappy. Or: tile the universe with simulated smiling faces.

Each interpretation is *technically* correct. None of them is what we meant.

**The gap between what we say and what we mean is where alignment fails.**

Researchers have tried several approaches:

1. **Explicit rules** - But we can't enumerate every possible scenario
2. **Learning from examples** - But examples contain our biases
3. **Learning from preferences** - But preferences change and conflict
4. **Inverse reinforcement learning** - But it requires perfect observation

Some scientists think the solution lies in "coherent extrapolated volition"—figuring out what humans *would* want if we were smarter, knew more, and had more time to think.

Others argue we should focus on "corrigibility"—creating AI that wants to be corrected when it's wrong.

**The uncomfortable truth: we're trying to teach machines values that we ourselves don't fully understand.**

Coming up: The race between capability and safety—and why we might be building the rocket before the brakes.`,
        summary: 'The value loading problem shows how difficult it is to translate human values into machine instructions—we struggle to define concepts like kindness or fairness in mathematical terms.',
      },
      {
        title: 'Episode 3: The Capability Control Problem',
        content: `There's a troubling asymmetry in AI development: making AI more powerful is easier than making it safe.

Every day, AI systems become more capable. GPT-4 can pass the bar exam. AI can design proteins, write code, and create art. The curve of capability is steep and accelerating.

But safety research? It moves slower. Much slower.

**We're in a race, and safety is losing.**

Here's why this is terrifying:

- **Economic incentives favor capability.** Companies that deploy powerful AI first win market share. Safety is a cost center.
- **Capability is measurable.** You can benchmark how well an AI scores on tests. How do you measure alignment?
- **Powerful AI is useful immediately.** Safe AI requires solving problems we don't fully understand yet.

Some researchers advocate for a "pause"—stopping capability research until safety catches up. But this faces a collective action problem: if one lab pauses, others will race ahead.

Others focus on "AI governance"—creating international agreements to regulate AI development. But how do you enforce rules on software that can be copied infinitely?

The most unsettling possibility: **there might not be a solution.** Some problems are simply too hard for human intelligence to solve. We might be creating beings smarter than us before we can control them.

**The question isn't whether we'll create superintelligence. It's whether we'll survive the transition.**

Next: The labs on the frontlines—and the internal debates tearing them apart.`,
        summary: 'The capability control problem reveals a troubling asymmetry: making AI more powerful is easier and more profitable than making it safe, creating a race where safety is losing.',
      },
    ],
  },
  {
    title: 'How Nuclear Fusion Actually Works',
    description: 'The sun has been doing it for 4.6 billion years. We\'ve been trying for 70. Inside the quest to recreate a star on Earth and unlock unlimited clean energy.',
    hookText: 'Scientists just achieved net energy gain for the third time this month. The fusion age is closer than you think...',
    type: 'live' as const,
    status: 'active' as const,
    topics: ['science', 'physics', 'environment'],
    episodes: [
      {
        title: 'Episode 1: Bottling a Star',
        content: `Every second, the sun converts 600 million tons of hydrogen into helium. The leftover mass becomes energy—enough to light up an entire solar system.

Fusion is the process that powers every star in the universe. It's the most abundant energy source in existence. And for 70 years, we've been trying to recreate it on Earth.

**The promise is almost too good to be true:**
- Virtually unlimited fuel (hydrogen from seawater)
- No carbon emissions
- No long-lived radioactive waste
- No risk of meltdown

But there's a catch. To fuse atoms together, you need to overcome the electromagnetic force that makes them repel each other. This requires temperatures of 150 million degrees Celsius—**ten times hotter than the core of the sun.**

At these temperatures, matter becomes plasma—a fourth state of matter where electrons are stripped from atoms. No physical container can hold plasma this hot. Touch the walls, and you lose all your energy instantly.

The solution? **Magnetic confinement.** Use powerful magnets to suspend the plasma in mid-air, never touching anything physical.

This is the principle behind the tokamak—a donut-shaped reactor where magnetic fields trap superhot plasma in an endless loop.

**The challenge: maintaining this delicate balance for more than a few seconds at a time.**

Next time: The breakthrough moment—when we finally got more energy out than we put in.`,
        summary: 'Fusion powers every star in the universe. To recreate it on Earth requires temperatures ten times hotter than the sun\'s core, held in place by powerful magnetic fields.',
      },
      {
        title: 'Episode 2: Breakeven and Beyond',
        content: `December 5, 2022. Lawrence Livermore National Laboratory. A team of scientists fires 192 laser beams at a tiny pellet of hydrogen the size of a peppercorn.

For a fraction of a second, conditions inside that pellet match the core of the sun. Atoms fuse. Energy releases.

**For the first time in history, humans produce more fusion energy than they put in.**

This is "ignition"—the holy grail that fusion scientists have chased for decades. The experiment produced 3.15 megajoules of energy from 2.05 megajoules of laser input. A gain of 1.5x.

Headlines declared it a breakthrough. And it was. But let's be honest about the fine print:

1. **It takes 300 megajoules to power those lasers.** The wall-plug efficiency is terrible.
2. **It lasted nanoseconds.** A practical reactor needs sustained reactions.
3. **You need to do this many times per second** to generate useful power.

Still, this was proof of concept. The physics works. The impossible is now merely very, very hard.

Since then, there have been more successful shots. The gains are improving. The consistency is improving.

**We've proven fusion works. Now we need to make it practical.**

The race is on between government megaprojects and scrappy startups. Between laser-based inertial confinement and magnetic tokamaks. Between decades-old approaches and radical new ideas.

Next: The machines—from giant donuts to compact reactors—and who's closest to commercial fusion.`,
        summary: 'In December 2022, scientists achieved fusion ignition for the first time—producing more energy from fusion than the lasers put in. The physics is proven; now comes the engineering.',
      },
    ],
  },
  {
    title: 'The Fall of Rome: Episode by Episode',
    description: 'It didn\'t fall in a day. It didn\'t even fall in a century. Follow the slow, fascinating collapse of history\'s greatest empire—and what it teaches us about today.',
    hookText: 'The parallels to modern civilization are so striking that historians are starting to worry...',
    type: 'series' as const,
    status: 'active' as const,
    topics: ['history', 'politics', 'culture'],
    episodes: [
      {
        title: 'Episode 1: The Empire at Its Peak',
        content: `117 AD. Emperor Trajan has just conquered Dacia. The Roman Empire stretches from Scotland to Mesopotamia, from Morocco to the Caspian Sea.

Fifty million people—one-fifth of the world's population—live under Roman rule. The Mediterranean is a Roman lake. Roman roads connect three continents. Roman law governs countless cultures.

**This is the high point. It will never be this good again.**

What made Rome so successful?

1. **The legions.** A professional army that could defeat any opponent through superior discipline and engineering.
2. **The roads.** 250,000 miles of paved highways that moved troops, trade, and ideas.
3. **The law.** A sophisticated legal system that applied (in theory) equally to all citizens.
4. **Assimilation.** Conquered peoples could become Roman—earn citizenship, join the legions, rise to power.

Rome wasn't just a military empire. It was an idea. Romanitas—Roman-ness—meant civilization itself. Running water. Public baths. Theaters. The rule of law.

**But cracks were already forming.**

The empire had grown too large to govern effectively. The frontiers were increasingly difficult to defend. The economy depended on constant expansion and conquest. And the system that selected emperors was a disaster waiting to happen.

The seeds of collapse were planted at the very height of success.

Coming up: The Crisis of the Third Century—when everything fell apart for fifty years.`,
        summary: 'At its peak in 117 AD, Rome ruled one-fifth of the world\'s population. But the seeds of collapse were planted in the very systems that made it successful.',
      },
      {
        title: 'Episode 2: The Crisis Begins',
        content: `235 AD. Emperor Alexander Severus is murdered by his own troops. What follows is fifty years of chaos.

In the next half-century, Rome will have at least 26 emperors. Most will be murdered. Some will last only weeks. Civil war will become the normal state of affairs.

**This is the Crisis of the Third Century—and it nearly destroyed Rome.**

What went wrong?

**The army problem.** By now, the legions knew they were the kingmakers. Emperors who didn't keep them happy didn't stay emperors for long. This created a vicious cycle: raise soldiers' pay → debase the currency → cause inflation → need to pay soldiers more.

**The succession problem.** Rome never solved the question of how to choose the next emperor. It was never formally a hereditary monarchy, but it was never truly elective either. This ambiguity created constant civil wars.

**The external pressure.** Germanic tribes pushed on the Rhine and Danube. The resurgent Persian Empire attacked from the east. Rome now faced major threats on multiple fronts simultaneously.

**The plague.** Starting in 249 AD, a devastating epidemic swept through the empire. Some cities lost half their population. The army was decimated.

At the low point, the empire fragmented into three parts. Gaul declared independence. Palmyra in Syria became its own empire. The "Roman Empire" controlled only Italy and the Balkans.

**Somehow, Rome survived.** But the Rome that emerged from the crisis was fundamentally different from the Rome that entered it.

Next time: The reforms that saved Rome—and the price they demanded.`,
        summary: 'The Crisis of the Third Century nearly destroyed Rome—fifty years of chaos, civil war, plague, and fragmentation that fundamentally transformed the empire.',
      },
    ],
  },
  {
    title: 'Your Brain on Dopamine',
    description: 'It\'s not the "pleasure chemical"—that\'s a myth. What dopamine actually does is far more interesting, and understanding it might change how you live your life.',
    hookText: 'Everything you\'ve heard about dopamine is wrong. Here\'s what the science actually says...',
    type: 'series' as const,
    status: 'active' as const,
    topics: ['psychology', 'science', 'biology'],
    episodes: [
      {
        title: 'Episode 1: The Wanting Chemical',
        content: `You've heard it a thousand times: dopamine is the "pleasure chemical." You get dopamine when you eat chocolate, have sex, win at gambling.

**This is wrong.**

Dopamine isn't about pleasure. It's about *wanting*. About *anticipation*. About *motivation*.

Here's the key experiment: Scientists gave mice a drug that blocked dopamine production. What happened?

The mice didn't stop *enjoying* food. When sugar was put directly in their mouths, they still showed pleasure reactions—they licked their lips, they came back for more.

But they stopped *wanting* food. They wouldn't cross the cage to get it. They would starve to death with food just inches away.

**Dopamine isn't the reward. Dopamine is the pursuit of the reward.**

This explains so much:

- Why anticipation often feels better than the actual event
- Why you keep scrolling even when you're not enjoying it
- Why addiction persists long after the "high" stops being pleasurable
- Why the chase is more exciting than the catch

Your brain releases dopamine when it *predicts* a reward is coming. The actual reward? That's processed by a different system (opioids, mostly).

**Dopamine is your brain's motivation system. It's not about feeling good—it's about taking action toward things that might feel good.**

Next time: The prediction error—what happens when reality doesn't match expectations.`,
        summary: 'Dopamine isn\'t the pleasure chemical—it\'s the wanting chemical. It drives motivation and anticipation, not enjoyment itself.',
      },
      {
        title: 'Episode 2: Prediction Error',
        content: `In the 1990s, Wolfram Schultz made a discovery that changed how we understand the brain.

He trained monkeys to expect juice when they saw a light flash. Then he measured their dopamine neurons.

**What he found was surprising:**

At first, dopamine spiked when the monkey got the juice—the reward.

But after training, the spike moved. Now dopamine spiked when the *light* appeared—the prediction of reward.

And when the juice came (as expected), there was no dopamine spike at all.

Most surprising: if the light appeared but *no juice came*, dopamine dropped *below baseline*.

**Dopamine doesn't signal rewards. It signals prediction errors—the difference between what you expected and what you got.**

This is called the "reward prediction error" (RPE). It's the mathematical formula your brain uses to learn:

- Better than expected → dopamine spike → "do more of that"
- As expected → no change → "this is normal"
- Worse than expected → dopamine drop → "avoid that"

This explains:

- Why the first bite is always the best (after that, you've adjusted expectations)
- Why novelty is exciting (unexpected = prediction error = dopamine)
- Why gambling is so addictive (intermittent rewards create maximum prediction errors)
- Why tolerance develops to drugs (the expected high creates no spike)

**Your brain is a prediction machine. Dopamine is how it learns.**

Coming up: How modern technology exploits this system—and what you can do about it.`,
        summary: 'Dopamine signals prediction errors—the gap between what you expected and what you got. This is how your brain learns what\'s worth pursuing.',
      },
    ],
  },
  {
    title: 'The Race to Quantum Computing',
    description: 'Google says they\'ve achieved "quantum supremacy." IBM says it\'s hype. China is spending billions. What\'s real, what\'s marketing, and why it matters for everyone.',
    hookText: 'Google\'s quantum computer just solved in 200 seconds what would take the fastest supercomputer 10,000 years...',
    type: 'live' as const,
    status: 'active' as const,
    topics: ['technology', 'physics', 'ai'],
    episodes: [
      {
        title: 'Episode 1: Beyond Binary',
        content: `Every computer you've ever used thinks in binary. Everything—your photos, your texts, your entire digital life—is represented as 1s and 0s.

Quantum computers don't work this way.

Instead of bits (1 or 0), they use qubits—quantum bits that can be 1, 0, or *both at the same time*.

This sounds impossible. It is impossible—in classical physics. But quantum mechanics allows particles to exist in "superposition"—multiple states simultaneously until observed.

**Imagine flipping a coin and having it be both heads AND tails until you look at it.**

This isn't just weird physics trivia. It has profound computational implications.

A classical computer with 3 bits can represent any single number from 0 to 7.

A quantum computer with 3 qubits can represent *all* numbers from 0 to 7 *simultaneously*.

Add more qubits, and this advantage grows exponentially:
- 10 qubits = 1,024 simultaneous states
- 50 qubits = 1 quadrillion simultaneous states
- 100 qubits = more states than atoms in the observable universe

**This isn't just faster. It's a fundamentally different kind of computation.**

For certain problems—simulating molecules, optimizing logistics, breaking encryption—quantum computers could be not just better, but impossibly, unreachably better.

But there's a catch. Actually, there are several catches. And they're why quantum computing is still more promise than reality.

Next time: The fragile, finicky, frustrating reality of building an actual quantum computer.`,
        summary: 'Quantum computers use qubits that can be 1 and 0 simultaneously, enabling exponentially more powerful computation—but only for certain types of problems.',
      },
    ],
  },
  {
    title: 'Micro Habits That Actually Stick',
    description: 'Tiny, almost invisible behaviors that compound into big life changes.',
    hookText: 'The smallest habit that moved the needle for high-performers was not what you think...',
    type: 'series' as const,
    status: 'active' as const,
    topics: ['psychology', 'productivity', 'behavior'],
    episodes: [
      {
        title: 'Chapter 1: The 30-Second Rule',
        content: `Most habits fail because they cost too much friction up front. The 30-second rule says: reduce any habit to something you can do in 30 seconds or less.\n\nLay out your shoes, open the doc, fill the water bottle. Completing the tiny setup counts as a win. The real work often follows automatically.`,
        summary: 'Lower friction so far that starting the habit takes under 30 seconds.',
      },
      {
        title: 'Chapter 2: Habit Pairing',
        content: `Pair a new habit with an existing one. After coffee, write one sentence. After brushing, stretch for 60 seconds.\n\nAnchoring to a stable routine avoids willpower battles because the cue already exists.`,
        summary: 'Attach the new behavior to a routine that already happens.',
      },
      {
        title: 'Chapter 3: Identity Beats Goals',
        content: `Goals end; identities persist. "I’m the kind of person who writes daily" outlasts "I will write 30 pages." Identities are reinforced by evidence—so make the evidence small and easy to collect.`,
        summary: 'Make the habit proof of the identity you want, not just a goal.',
      },
      {
        title: 'Chapter 4: The Two-Day Rule',
        content: `Miss a day? Fine. Miss two and the habit decays fast. The Two-Day Rule keeps streaks forgiving but prevents slide-offs.\n\nDesign for recovery, not perfection.`,
        summary: 'Never miss twice—build forgiveness into the system.',
      },
    ],
  },
  {
    title: 'Inside the James Webb Telescope',
    description: 'How JWST rewrote our view of the early universe.',
    hookText: 'A 21-foot mirror unfolding a million miles away is quietly breaking cosmology puzzles...',
    type: 'live' as const,
    status: 'active' as const,
    topics: ['space', 'science', 'technology'],
    episodes: [
      {
        title: 'Chapter 1: The Origami Mirror',
        content: `JWST launched folded like space origami. Its 18 gold-coated segments had to align to within tens of nanometers while a tennis-court sunshield blocked Earth’s heat.\n\nMiss by a hair and the $10B mission would have been a sculpture.`,
        summary: 'JWST’s unfolding mirror and sunshield were high-risk, high-precision feats.',
      },
      {
        title: 'Chapter 2: Looking Back 13.5 Billion Years',
        content: `Infrared vision lets JWST see the redshifted light of the first galaxies. We’re watching baby galaxies that existed a few hundred million years after the Big Bang.\n\nSurprise: some look too massive, too early—challenging models of galaxy formation.`,
        summary: 'Infrared eyes reveal surprisingly massive early galaxies, challenging models.',
      },
      {
        title: 'Chapter 3: Exoplanet Weather Reports',
        content: `JWST can read the atmospheres of exoplanets by watching starlight filter through them. We’ve detected water vapor, carbon dioxide, even hints of hazes and storms on worlds hundreds of light years away.`,
        summary: 'Spectroscopy lets JWST sense gases and weather on distant exoplanets.',
      },
      {
        title: 'Chapter 4: The Cosmic Supply Chain',
        content: `Dust is the raw material for planets. JWST is mapping dust in stellar nurseries and supernova leftovers, showing how stars recycle material into future solar systems.`,
        summary: 'JWST maps cosmic dust—the ingredient list for future planets.',
      },
    ],
  },
  {
    title: 'How CRISPR Changed Medicine',
    description: 'From cutting DNA to curing diseases—what CRISPR can and can’t do yet.',
    hookText: 'We now edit DNA almost as easily as text. The hard part is everything else.',
    type: 'series' as const,
    status: 'active' as const,
    topics: ['biology', 'medicine', 'technology'],
    episodes: [
      {
        title: 'Chapter 1: The Bacterial Defense That Rewired Biology',
        content: `CRISPR started as an immune system for bacteria—archiving viral mugshots, then cutting matching invaders. Scientists turned that into a programmable gene editor using a simple guide RNA.`,
        summary: 'A bacterial immune trick became a programmable DNA editor.',
      },
      {
        title: 'Chapter 2: The Delivery Problem',
        content: `Editing is easy in a dish; it’s hard in a body. Getting CRISPR into the right cells without off-target edits is the central engineering challenge. Lipid nanoparticles and viral vectors are today’s best bets.`,
        summary: 'The hard part is delivering CRISPR to the right cells safely.',
      },
      {
        title: 'Chapter 3: First Real Cures',
        content: `Sickle cell disease and beta thalassemia patients have now been treated with CRISPR-edited stem cells. It works—but costs and risks are still high.`,
        summary: 'Early clinical wins show cures are possible but not yet cheap or easy.',
      },
      {
        title: 'Chapter 4: What We Still Fear',
        content: `Off-target edits, mosaicism, and germline changes raise ethical alarms. Most nations ban editing embryos for implantation. Somatic (non-heritable) edits are where the field is racing ahead.`,
        summary: 'Ethics and safety keep germline editing off-limits; somatic edits lead.',
      },
    ],
  },
  {
    title: 'Why Money Flows Like Water',
    description: 'A beginner-friendly look at how money moves through an economy.',
    hookText: 'You don’t need macro textbooks—just follow where the money actually goes.',
    type: 'series' as const,
    status: 'active' as const,
    topics: ['economics', 'psychology', 'policy'],
    episodes: [
      {
        title: 'Chapter 1: The Pipe and the Pool',
        content: `Think of income as a pipe and savings as a pool. If the pipe slows, the pool drains. Policy debates are mostly about which pipe to open and which pool to tax.`,
        summary: 'Income is a pipe, savings a pool; policy adjusts flow and levels.',
      },
      {
        title: 'Chapter 2: Why Interest Exists',
        content: `Interest is the rent on money. It prices time and risk. When rates fall, borrowing gets cheaper and future earnings look shinier—so assets inflate. When rates rise, the reverse happens.`,
        summary: 'Interest is rent on money; changing rates reprice everything.',
      },
      {
        title: 'Chapter 3: Inflation Is a Story Battle',
        content: `Prices rise when demand overwhelms supply—but expectations matter. If people believe prices will keep rising, they accelerate purchases, creating the very inflation they fear.`,
        summary: 'Inflation is part math, part collective story about the future.',
      },
      {
        title: 'Chapter 4: Recessions as Reset Buttons',
        content: `Recessions clear bad bets and reset expectations. Painful, but they often sow the seeds of the next expansion as costs fall and risk appetite slowly returns.`,
        summary: 'Recessions purge excesses and reset the stage for future growth.',
      },
    ],
  },
  {
    title: 'The Hidden Math of Everyday Life',
    description: 'Tiny bits of math quietly power the things you use daily.',
    hookText: 'You’re already doing math—maps, memes, microwaves—without noticing.',
    type: 'series' as const,
    status: 'active' as const,
    topics: ['mathematics', 'technology', 'science'],
    episodes: [
      {
        title: 'Chapter 1: GPS and Trilateration',
        content: `Your maps app uses trilateration—measuring distance from at least four satellites. Each satellite sends a timestamp; tiny timing errors mean miles of drift, so atomic clocks make it possible.`,
        summary: 'Position comes from timing four satellites with atomic clock precision.',
      },
      {
        title: 'Chapter 2: The JPEG Diet',
        content: `JPEG shrinks photos using the Discrete Cosine Transform. It throws away details your eyes barely notice, turning smooth gradients into a handful of frequency coefficients.`,
        summary: 'JPEG relies on a cosine transform to keep what your eyes care about.',
      },
      {
        title: 'Chapter 3: Memes and Virality Math',
        content: `Virality follows branching processes. Each share has a reproduction number. Most posts die; a few cross the tipping point where R>1 and explode.`,
        summary: 'Virality behaves like branching processes with R values over 1.',
      },
      {
        title: 'Chapter 4: Microwaves and Standing Waves',
        content: `Microwaves heat by exciting water molecules. The turntable exists because standing waves leave cold spots; spinning averages the peaks and troughs.`,
        summary: 'Turntables fight standing waves so food doesn’t have cold spots.',
      },
    ],
  },
  {
    title: 'Cities That Learned to Breathe Again',
    description: 'Urban stories of beating pollution without killing growth.',
    hookText: 'From smog-choked to breathable in a decade—what actually worked?',
    type: 'live' as const,
    status: 'active' as const,
    topics: ['environment', 'policy', 'urban'],
    episodes: [
      {
        title: 'Chapter 1: The London Congestion Bet',
        content: `London slapped a fee on driving into the core. Traffic dropped, buses sped up, emissions fell. The revenue funded better transit—a virtuous loop.`,
        summary: 'Charging cars in the core cut traffic and funded better transit.',
      },
      {
        title: 'Chapter 2: Seoul’s Highway Teardown',
        content: `Seoul removed a downtown highway and restored the Cheonggyecheon stream. Property values rose, temperatures cooled, and traffic found other routes or vanished.`,
        summary: 'Removing a highway improved air, land values, and livability.',
      },
      {
        title: 'Chapter 3: Beijing’s Blue-Sky Sprint',
        content: `Ahead of the 2008 Olympics, Beijing staggered factory schedules, restricted cars, and upgraded boilers. It proved pollution could be cut fast—at a cost.`,
        summary: 'Beijing showed rapid pollution cuts are possible with aggressive controls.',
      },
      {
        title: 'Chapter 4: Mexico City’s Clean Bus Gamble',
        content: `Bus Rapid Transit lanes replaced chaotic minibuses. Dedicated lanes plus cleaner engines cut particulates and made commutes predictable.`,
        summary: 'BRT lanes cleaned air and made trips reliable.',
      },
    ],
  },
  {
    title: 'The Race to Private Space',
    description: 'Why rockets suddenly look reusable—and what that unlocks.',
    hookText: 'A decade ago rockets were sink costs. Now they land themselves.',
    type: 'live' as const,
    status: 'active' as const,
    topics: ['space', 'technology', 'economics'],
    episodes: [
      {
        title: 'Chapter 1: Reusability Math',
        content: `Reusing boosters slashes launch cost per kilogram. The hard part was landing reliably. Once solved, it changed the economics from bespoke to fly-again.`,
        summary: 'Landing boosters made launches vastly cheaper per kilogram.',
      },
      {
        title: 'Chapter 2: The New Supply Chain',
        content: `Private launchers now control the ride to orbit. That means constellation owners can launch on their schedule, not wait years for a rideshare slot.`,
        summary: 'Owning the rocket means controlling the schedule and cadence.',
      },
      {
        title: 'Chapter 3: Why Satellites Got Tiny',
        content: `CubeSats and smallsats shrank thanks to smartphone parts and better solar. Reusable launchers make it economical to throw up swarms for imaging or internet.`,
        summary: 'Smallsats + cheap launches enable swarms of focused spacecraft.',
      },
      {
        title: 'Chapter 4: Space Junk Headaches',
        content: `More launches mean more debris risk. Active debris removal and end-of-life deorbit plans are becoming mandatory to keep orbits usable.`,
        summary: 'Reusability drives traffic; debris mitigation becomes critical.',
      },
    ],
  },
  {
    title: 'The Secret Life of Sleep',
    description: 'Why your brain treats sleep like nightly maintenance.',
    hookText: 'Sleep isn’t a pause button—it’s an active cleanup job.',
    type: 'series' as const,
    status: 'active' as const,
    topics: ['biology', 'psychology', 'health'],
    episodes: [
      {
        title: 'Chapter 1: The Brain Wash Cycle',
        content: `During deep sleep, cerebrospinal fluid pulses through the brain, clearing metabolic waste. Think of it as a nightly rinse cycle that only runs when you’re offline.`,
        summary: 'Deep sleep is the brain’s cleanup cycle for metabolic waste.',
      },
      {
        title: 'Chapter 2: Memory as a Remix',
        content: `Memories are replayed and consolidated while you sleep. The brain decides what to keep, what to forget, and where to file it.`,
        summary: 'Sleep replays memories and files them for long-term storage.',
      },
      {
        title: 'Chapter 3: Dreams as Noise-Canceling',
        content: `One theory: dreams are the brain’s way of preventing overfitting by injecting noise. They may also be emotional rehearsal spaces.`,
        summary: 'Dreams may keep the brain from overfitting and process emotions.',
      },
      {
        title: 'Chapter 4: The Cost of Cutting Sleep',
        content: `Short sleep impairs insulin sensitivity, mood, and learning. The debt is cumulative; you can’t “bank” sleep on weekends very well.`,
        summary: 'Sleep debt stacks up, hurting metabolism, mood, and learning.',
      },
    ],
  },
];

// ==================================================
// DATABASE OPERATIONS
// ==================================================

async function clearDatabase() {
  console.log('Clearing existing data...');
  
  // Delete in order to respect foreign keys
  await supabase.from('user_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('saved_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('rabbit_hole_topics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('episodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('rabbit_holes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('Database cleared.');
}

async function seedStaticContent() {
  console.log('Seeding static content...');
  
  for (const rhData of SEED_RABBIT_HOLES) {
    console.log(`Creating rabbit hole: ${rhData.title}`);
    
    // Insert rabbit hole
    const { data: rabbitHole, error: rhError } = await supabase
      .from('rabbit_holes')
      .insert({
        title: rhData.title,
        description: rhData.description,
        hook_text: rhData.hookText,
        type: rhData.type,
        status: rhData.status,
        total_episodes: rhData.episodes.length,
      })
      .select()
      .single();

    if (rhError || !rabbitHole) {
      console.error(`Error creating rabbit hole: ${rhError?.message}`);
      continue;
    }

    // Insert topics
    const topicInserts = rhData.topics.map(topic => ({
      rabbit_hole_id: rabbitHole.id,
      topic,
    }));

    const { error: topicError } = await supabase
      .from('rabbit_hole_topics')
      .insert(topicInserts);

    if (topicError) {
      console.warn(`Error inserting topics: ${topicError.message}`);
    }

    // Insert episodes
    for (let i = 0; i < rhData.episodes.length; i++) {
      const epData = rhData.episodes[i];
      
      const { error: epError } = await supabase
        .from('episodes')
        .insert({
          rabbit_hole_id: rabbitHole.id,
          episode_number: i + 1,
          title: epData.title,
          content: epData.content,
          content_type: 'text',
          summary: epData.summary,
          is_update: false,
        });

      if (epError) {
        console.error(`Error creating episode: ${epError.message}`);
      } else {
        console.log(`  Created episode ${i + 1}: ${epData.title}`);
      }
    }
  }
  
  console.log('\nSeeding complete!');
}

// ==================================================
// MAIN
// ==================================================

async function main() {
  console.log('=================================');
  console.log('iScroll Seed Content Script');
  console.log('=================================\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERROR: Supabase credentials not set.');
    console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  const useStatic = process.argv.includes('--static') || !GEMINI_API_KEY;
  
  if (useStatic) {
    console.log('Using static seed content...\n');
    await clearDatabase();
    await seedStaticContent();
  } else {
    console.log('AI content generation requires Gemini API key.');
    console.log('Running with static content instead...\n');
    await clearDatabase();
    await seedStaticContent();
  }

  console.log('\n=================================');
  console.log('Done! Your database is now populated.');
  console.log('=================================');
}

main().catch(console.error);
