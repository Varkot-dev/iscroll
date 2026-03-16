/**
 * Seed script — 50 learn cards across 12 topic chains
 *
 * Usage: npm run seed
 *
 * Strategy:
 * Pass 1 — insert all 50 posts with related_post_id = null, capture UUIDs
 * Pass 2 — UPDATE to wire up chain links
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from .env in project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Card definitions — each entry will become one row in `posts`
// ---------------------------------------------------------------------------

type CardDef = {
  key: string;          // unique slug — used to wire chains
  title: string;
  content: string;
  wowFact: string;
  topics: string[];
  subtopics: string[];  // specific subtopics within the broad topic
  depth: number;        // 1 (surface) → 5 (expert)
  summary: string;
  nextKey: string | null;
};

const CARDS: CardDef[] = [
  // ── Magnetism (4) ──────────────────────────────────────────────────────────
  {
    key: 'compass',
    title: 'Why a Compass Always Points North',
    content: `Before GPS, sailors and explorers trusted a thin magnetized needle to survive. That needle doesn't point at the North Pole — it points at the magnetic north pole, a wandering spot in northern Canada about 500 km from the geographic pole. The needle aligns with Earth's magnetic field lines, which wrap around the planet like invisible strings from core to crust. The field is generated deep underground where liquid iron churns in the outer core, creating massive electric currents. Those currents act like a giant electromagnet wrapped around the planet. The compass works because every magnet, including your tiny needle, wants to align with external magnetic fields. It's essentially a miniature version of the same force that makes iron filings snap into patterns around a bar magnet.`,
    wowFact: 'Earth\'s magnetic poles have flipped hundreds of times in history — the last reversal was 780,000 years ago, and we may be overdue for the next one.',
    topics: ['physics', 'science'],
    summary: 'How a tiny magnetized needle can reliably point you home.',
    nextKey: 'earth-magnetic-field',
  },
  {
    key: 'earth-magnetic-field',
    title: "Earth's Magnetic Field Is Slowly Weakening",
    content: `Earth's magnetic field has dropped about 9% in the past 170 years. This isn't catastrophic news yet, but it matters more than most people realize. The field is what deflects the solar wind — a constant stream of charged particles blasted from the Sun. Without it, those particles would strip away our atmosphere over millions of years, turning Earth into a cold, dry rock like Mars. The weakening field also creates the South Atlantic Anomaly, a region off Brazil where the field dips so low that satellites and the International Space Station experience more radiation damage there than anywhere else. Scientists believe the weakening is tied to slow convection changes deep in Earth's liquid iron outer core. It may stabilize, or it may be a precursor to another magnetic pole reversal.`,
    wowFact: 'During a pole reversal, Earth\'s magnetic field doesn\'t just flip — it collapses to nearly zero first, leaving the surface exposed to solar radiation for thousands of years.',
    topics: ['physics', 'science', 'space'],
    summary: 'The invisible shield around Earth is getting weaker — here\'s why that matters.',
    nextKey: 'solenoid',
  },
  {
    key: 'solenoid',
    title: 'The Solenoid: The World\'s Most Useful Shape',
    content: `Take a wire, wrap it into a tight coil, and run electricity through it — you've just built a solenoid. This humble shape is quietly one of the most important inventions in modern life. When current flows through the coil, each loop generates a tiny magnetic field, and all those fields stack together to form one powerful magnet. Unlike a permanent magnet, you can turn it on and off, change its strength, and reverse its polarity just by adjusting the current. Solenoids are in your car's starter motor, the valves in your washing machine, the locks on your doors, the triggers in pinball machines, and the speakers you're listening to right now. They're also the operating principle behind every electric motor ever built. Faraday's law says that changing magnetic fields create electric currents — and solenoids work both ways.`,
    wowFact: 'The solenoid inside a car starter motor briefly draws 200+ amps from the battery — more current than your entire home uses at once.',
    topics: ['physics', 'technology'],
    summary: 'A coiled wire that powers almost every electric motor on Earth.',
    nextKey: 'mri',
  },
  {
    key: 'mri',
    title: 'How an MRI Machine Sees Inside You',
    content: `An MRI machine is a 7-tonne solenoid cooled to -269°C with liquid helium — colder than outer space. The superconducting coils carry enormous currents with zero resistance, creating a magnetic field up to 100,000 times stronger than Earth's. When you slide inside, that field forces the protons in your hydrogen atoms to align with it. Then the machine fires radio waves at a precise frequency that causes those protons to absorb energy and flip. When the radio pulse stops, the protons relax back to their aligned state and release that energy as their own radio signal. Different tissues — fat, water, muscle — release energy at different rates, so a computer can reconstruct a detailed 3D map of your internal anatomy. No radiation. No cutting. Just the physics of spinning hydrogen atoms.`,
    wowFact: 'If a steel oxygen tank is accidentally brought into an MRI room, it becomes a 160 km/h missile — several people have been killed this way.',
    topics: ['physics', 'medicine', 'technology'],
    summary: 'The physics behind the most powerful medical imaging machine ever built.',
    nextKey: null,
  },

  // ── Memory (3) ─────────────────────────────────────────────────────────────
  {
    key: 'forgetting',
    title: "Why You Forget Almost Everything You Read",
    content: `Within 20 minutes of learning something, you forget roughly 42% of it. Within a day, 67%. Within a week, 75%. This is the Ebbinghaus Forgetting Curve, discovered in the 1880s when Hermann Ebbinghaus spent years memorizing thousands of nonsense syllables and carefully tracking when he forgot them. The curve is brutal but not inevitable. Forgetting isn't a flaw — it's memory doing exactly what it evolved to do: remove information that seems unimportant. Your brain decides what to keep based on emotional significance and repetition. The knowledge that saved your ancestors from a predator got reinforced. The lecture about the Treaty of Westphalia? Your brain correctly guessed you wouldn't need it again. The key insight is that every time you recall something, you reset the forgetting clock and strengthen the neural pathway. Retrieval is storage.`,
    wowFact: 'Ebbinghaus memorized 2,300 lists of nonsense syllables over years to generate his forgetting curve data — sacrificing himself to science with monumental tedium.',
    topics: ['psychology', 'science'],
    summary: 'The brutal mathematics of why your brain erases most of what you learn.',
    nextKey: 'sleep-consolidation',
  },
  {
    key: 'sleep-consolidation',
    title: 'Sleep Is When You Actually Learn',
    content: `When you sleep, your brain isn't resting — it's running a massive overnight filing operation. During slow-wave sleep, your hippocampus replays the day's experiences at 20x speed, transferring memory traces to the cortex for long-term storage. During REM sleep, the brain strips emotional content from memories (helpful for processing trauma) and finds patterns across seemingly unrelated experiences — which is partly why creative breakthroughs often happen after sleep. Studies show that sleep after learning improves test performance by 20-40% compared to studying the same amount but staying awake. The memory consolidation window is roughly 12 hours after learning. The brutal implication: pulling an all-nighter before an exam actively destroys the memories you spent all day forming. The brain doesn't consolidate what it hasn't slept on.`,
    wowFact: 'Cutting sleep from 8 to 6 hours triples the chance of a car accident — reaction time impairment matches being legally drunk at 0.10% BAC.',
    topics: ['psychology', 'biology', 'science'],
    summary: 'Memory consolidation happens during sleep, not while you\'re studying.',
    nextKey: 'spacing-effect',
  },
  {
    key: 'spacing-effect',
    title: 'The Spacing Effect: The Most Underused Learning Tool',
    content: `The most efficient study method is also one of the most counterintuitive. Instead of reviewing material in one long session — what psychologists call "massed practice" — you space reviews out over increasing intervals. Review once, then again after one day, then four days, then two weeks, then a month. The Spacing Effect, discovered independently by Ebbinghaus and later validated across hundreds of studies, shows this approach requires 40-60% less total study time to achieve the same retention as cramming. The reason is biological: spacing forces your brain to partly forget and then retrieve. That retrieval effort strengthens the neural pathway in ways passive re-reading never does. Anki, the free flashcard app, implements this with a spaced-repetition algorithm. Students using it routinely retain 90%+ of material they haven't seen in years.`,
    wowFact: 'Retired doctors who used spaced repetition in medical school retain diagnostic accuracy at 80% years later — while peers who crammed forgot most of it within months of graduation.',
    topics: ['psychology', 'science'],
    summary: 'Why spacing out your studying is more effective than cramming.',
    nextKey: null,
  },

  // ── Gravity (4) ────────────────────────────────────────────────────────────
  {
    key: 'why-things-fall',
    title: 'Why Do Things Fall?',
    content: `Newton watched an apple fall and proposed that every mass in the universe attracts every other mass. The force between them scales with their masses and shrinks with the square of the distance between them. This explained the tides, the orbits of planets, and why the Moon doesn't drift away. But Newton's explanation was essentially "things fall because I said so" — he never explained why masses attract each other, and he knew it. Einstein flipped the model. In general relativity, gravity isn't a force at all. Mass curves spacetime — the four-dimensional fabric of reality. Objects then simply travel in straight lines through that curved spacetime. What we perceive as falling is actually following a straight path through a warped geometry. The apple doesn't fall toward Earth — both the apple and Earth move toward the point where spacetime curves most steeply.`,
    wowFact: 'A hammer and a feather dropped on the Moon hit the surface at exactly the same time — Apollo 15 astronaut David Scott proved this on live television in 1971.',
    topics: ['physics', 'science', 'space'],
    summary: 'From Newton\'s apple to Einstein\'s warped spacetime — two completely different answers to the same question.',
    nextKey: 'escape-velocity',
  },
  {
    key: 'escape-velocity',
    title: 'Escape Velocity: Breaking Free from a Planet',
    content: `Escape velocity is the minimum speed an object needs to leave a planet's gravity well without any further propulsion. For Earth, it's 11.2 km/s — about 40,000 km/h. Note the key word "minimum": this is only the right speed if you launch in one explosive burst. Rockets don't need to reach escape velocity because they burn fuel continuously, trading chemical energy for kinetic and potential energy the whole way. Escape velocity depends on both mass and radius. Jupiter is 318 times more massive than Earth, so escaping it requires 60 km/s. A neutron star — essentially a dead star compressed to the size of a city — has an escape velocity that approaches the speed of light. At exactly the speed of light, you reach the most famous boundary in physics.`,
    wowFact: 'The Moon\'s escape velocity is only 2.4 km/s — so low that astronauts can launch from its surface with a rocket no bigger than a small car.',
    topics: ['physics', 'space', 'science'],
    summary: 'The speed you need to escape a planet — and what happens when nothing is fast enough.',
    nextKey: 'black-holes',
  },
  {
    key: 'black-holes',
    title: 'Black Holes Are Not What You Think',
    content: `Black holes are regions of spacetime where gravity is so intense that the escape velocity exceeds the speed of light. Nothing — not even photons — can escape once past the event horizon. But a black hole isn't a cosmic vacuum cleaner. If you replaced the Sun with a black hole of equal mass, every planet would keep its current orbit undisturbed. The black hole would be more dangerous for different reasons: no sunlight. What makes black holes genuinely weird is that time dilation becomes extreme near the event horizon. An observer falling in would feel nothing special crossing it — they'd continue falling normally for seconds in their frame. But to a distant observer, they'd appear to slow down, redshift, and freeze asymptotically at the horizon, never quite crossing it from the outside perspective.`,
    wowFact: 'The supermassive black hole at the center of our galaxy, Sagittarius A*, has a mass of 4 million suns — yet it\'s currently dormant and quiet.',
    topics: ['physics', 'space', 'science'],
    summary: 'The truth behind the universe\'s most misunderstood objects.',
    nextKey: 'event-horizon',
  },
  {
    key: 'event-horizon',
    title: 'The Event Horizon: The Universe\'s Point of No Return',
    content: `The event horizon is not a physical surface. You can't touch it. There's no wall, no barrier, no change in temperature or pressure. It's simply the mathematically defined boundary beyond which escape is impossible. For a non-rotating black hole, the event horizon is a perfect sphere called the Schwarzschild radius. For Earth's mass, that sphere would be smaller than a marble — 9mm across. The paradox that has haunted physicists for decades is what happens to information beyond the horizon. Quantum mechanics insists information can never be truly destroyed. General relativity insists that anything crossing the event horizon can never escape. Stephen Hawking's 1974 discovery that black holes slowly evaporate via quantum radiation suggested a resolution — but whether information is preserved or destroyed remains one of the deepest open questions in physics.`,
    wowFact: 'Hawking radiation from a stellar-mass black hole is so cold — roughly 60 nanokelvin — that it would take longer than the current age of the universe to evaporate a single one.',
    topics: ['physics', 'space', 'science'],
    summary: 'The physics of the boundary from which nothing can return.',
    nextKey: null,
  },

  // ── DNA (3) ────────────────────────────────────────────────────────────────
  {
    key: 'what-dna-is',
    title: 'What DNA Actually Is',
    content: `DNA is a molecule shaped like a twisted ladder — the famous double helix. The sides of the ladder are made of alternating sugar and phosphate groups. The rungs are pairs of four chemical bases: adenine, thymine, guanine, and cytosine. The bases pair in only two ways: A with T, and G with C. This pairing rule is everything — it means that if you know the sequence on one strand, you know the sequence on the other. It's what makes copying possible. A human cell contains about 3 billion of these base pairs, uncoiled to roughly 2 meters of DNA, packed into a nucleus 6 micrometers wide. The packing is achieved by wrapping DNA around spool-like proteins called histones. The sequence of bases encodes instructions for building proteins, which do essentially everything in your body. You share about 99% of your DNA with every other human alive today.`,
    wowFact: 'If you stretched out the DNA from every cell in your body end to end, the strand would reach the Sun and back roughly 600 times.',
    topics: ['biology', 'science'],
    summary: 'The chemical reality behind the molecule that encodes all life.',
    nextKey: 'how-cells-read-dna',
  },
  {
    key: 'how-cells-read-dna',
    title: 'How Cells Read DNA',
    content: `DNA itself does nothing — it's a storage molecule. Reading it requires a process called transcription. An enzyme called RNA polymerase unzips a section of the double helix and moves along one strand, building a complementary molecule called messenger RNA. The mRNA then travels out of the nucleus to a ribosome, which reads it three bases at a time. Each three-base sequence (a codon) corresponds to one amino acid. Ribosomes link amino acids in the sequence specified by the mRNA, building a protein chain that then folds into a precise three-dimensional shape. That shape determines what the protein does — enzyme, structural support, hormone, signal receptor. The entire process from DNA sequence to folded protein takes about ten minutes. Your body runs thousands of these production lines simultaneously in every cell, every second.`,
    wowFact: 'The ribosome is often called the most complex molecular machine in biology — it has no moving parts, yet it assembles proteins faster than any human-built nanomachine.',
    topics: ['biology', 'science'],
    summary: 'The molecular assembly line that turns DNA code into living proteins.',
    nextKey: 'crispr',
  },
  {
    key: 'crispr',
    title: 'CRISPR: Cut, Paste, Edit Life',
    content: `CRISPR-Cas9 is a bacterial immune system that scientists repurposed into a gene editor. When bacteria survive a viral infection, they store fragments of the virus's DNA in their own genome as a molecular "mug shot." If that virus attacks again, the bacteria transcribe the mug shot into a guide RNA and deploy the Cas9 protein, which hunts the viral DNA sequence and cuts it. Scientists realized they could program the guide RNA to target any DNA sequence they wanted — in any organism. Cas9 then cuts the DNA at that exact spot. The cell's own repair machinery kicks in to fix the break. By providing a template during repair, researchers can insert, delete, or modify almost any gene. In 2023, CRISPR therapies for sickle cell disease were approved — the first treatments to cure a genetic disease by editing the patient's own DNA.`,
    wowFact: 'CRISPR was hiding in plain sight for decades — scientists had sequenced CRISPR arrays in bacteria since the 1990s without understanding what they were for.',
    topics: ['biology', 'medicine', 'science'],
    summary: 'The gene-editing tool that could cure inherited diseases — borrowed from bacteria.',
    nextKey: null,
  },

  // ── Numbers (4) ────────────────────────────────────────────────────────────
  {
    key: 'why-zero-invented',
    title: 'Why Zero Took 1,500 Years to Invent',
    content: `Zero is so obvious to us that it's hard to imagine a world without it. Ancient Egypt, Greece, and Rome all built empires without it. Roman numerals have no zero — try writing 2024 in Roman numerals and you'll understand the problem. The concept of zero as a number (not just a placeholder) was invented in India around 628 CE by mathematician Brahmagupta. He defined zero as the result of subtracting a number from itself, established rules for arithmetic with zero, and grappled with division by zero. Why did it take so long? The psychological barrier is that zero represents nothing — and it feels strange to count "nothing" as a number. It forced a conceptual leap from numbers as descriptions of real quantities to numbers as abstract objects with their own rules. That leap made algebra, calculus, and computers possible.`,
    wowFact: 'The Babylonians used a placeholder symbol for zero as early as 300 BCE, but never treated it as a true number — they could represent "nothing in the middle" but not "nothing at all."',
    topics: ['mathematics', 'history'],
    summary: 'The philosophical breakthrough that makes all modern mathematics possible.',
    nextKey: 'infinity',
  },
  {
    key: 'infinity',
    title: 'Infinity Isn\'t One Thing',
    content: `Infinity sounds like a single concept — the biggest possible thing. It isn't. In 1874, Georg Cantor proved there are different sizes of infinity. Consider counting numbers: 1, 2, 3... This is infinite. Now consider all decimal numbers between 0 and 1: 0.1, 0.11, 0.111... Cantor proved this second set is strictly larger — you literally cannot match counting numbers to decimal numbers one-to-one. There will always be decimals left over. This sounds paradoxical. How can one infinity be bigger than another? Cantor showed it using his famous diagonal argument: assume you've listed all decimal numbers, then construct a new number by changing the first digit of the first number, the second digit of the second, and so on. This new number can't be anywhere on your list. Therefore your list was incomplete. Therefore decimal infinities are uncountable — strictly larger than counting infinities.`,
    wowFact: 'Cantor\'s work was so radical that his mentor Leopold Kronecker called him a "corrupter of youth" and tried to destroy his career. Cantor died in a sanatorium in 1918.',
    topics: ['mathematics', 'philosophy'],
    summary: 'The mind-bending proof that some infinities are bigger than others.',
    nextKey: 'prime-numbers',
  },
  {
    key: 'prime-numbers',
    title: 'Why Prime Numbers Are Everywhere',
    content: `A prime is a number divisible only by 1 and itself: 2, 3, 5, 7, 11... They seem like a curiosity of abstract math, but primes are woven into the structure of reality. In nature, cicadas emerge in prime-number cycles (13 or 17 years) because prime cycles are hardest for predators to synchronize with. In technology, the security of every HTTPS connection you make relies on the difficulty of factoring large numbers into their prime components. A 2048-bit RSA key is the product of two primes roughly 300 digits long. Finding those primes from their product is computationally infeasible — breaking it would take existing computers longer than the age of the universe. Prime numbers are also mysteriously distributed. The Prime Number Theorem predicts their frequency, but the exact location of each prime remains essentially unpredictable.`,
    wowFact: 'The largest known prime number has over 41 million digits — it was found in 2024 using volunteer computing power from thousands of home PCs.',
    topics: ['mathematics', 'science'],
    summary: 'The numbers that secure the internet and shape how cicadas evolved.',
    nextKey: 'encryption',
  },
  {
    key: 'encryption',
    title: 'How Encryption Protects Every Message You Send',
    content: `When you visit a website over HTTPS, your browser and the server perform a handshake in milliseconds. The server sends its public key — a large number anyone can see. You use it to encrypt a message that only the server can decrypt using its private key. This works because of a mathematical trapdoor: multiplying two large primes together is trivially fast, but factoring the result back into its prime components is computationally infeasible. The public key is the product; the private key is the primes. Modern encryption also uses elliptic curve cryptography, which offers the same security with smaller keys. The genuinely alarming development: quantum computers, if they become powerful enough, can run Shor's algorithm to factor large numbers exponentially faster. That's why governments and companies are urgently migrating to post-quantum cryptography algorithms that even quantum computers can't break.`,
    wowFact: 'The Allies\' ability to break Nazi Enigma encryption — essentially the birth of modern cryptography — shortened World War II by an estimated 2-4 years.',
    topics: ['mathematics', 'technology', 'history'],
    summary: 'The prime number trick that keeps your passwords and bank details private.',
    nextKey: null,
  },

  // ── Light (3) ──────────────────────────────────────────────────────────────
  {
    key: 'blue-sky',
    title: 'Why the Sky Is Blue',
    content: `White sunlight is a mixture of all wavelengths of visible light. When it enters the atmosphere, it collides with nitrogen and oxygen molecules. Short wavelengths — blue and violet — scatter much more than long wavelengths like red and orange. This is Rayleigh scattering, and the effect is dramatic: blue light scatters about 10 times more than red light. As sunlight penetrates the atmosphere, blue light is knocked in all directions, filling the entire sky dome with scattered blue photons. You actually see slightly more violet light than blue — but your eyes are less sensitive to violet, so the sky looks blue. When you look directly at the Sun (don't), you see the unscattered residual wavelengths — a yellowish white. Planets with different atmospheres have different sky colors. Mars has a thin atmosphere with iron-oxide dust, so its sky is a muted butterscotch during the day and blue at sunset — the opposite of Earth.`,
    wowFact: 'On the Moon, which has no atmosphere to scatter light, the sky is completely black even when the Sun is directly overhead.',
    topics: ['physics', 'science'],
    summary: 'The physics behind the most familiar color in human experience.',
    nextKey: 'rainbows',
  },
  {
    key: 'rainbows',
    title: 'How a Rainbow Is Made',
    content: `A rainbow requires three things: sunlight behind you, water droplets in front of you, and your eyes. When sunlight enters a spherical raindrop, it refracts — bends at an angle that depends on wavelength. Red bends the least, violet bends the most. The light then reflects off the back of the droplet and refracts again as it exits. The cumulative effect separates the wavelengths into their constituent colors, sending each color to your eyes at a slightly different angle. Red arrives at 42°, violet at 40°. Because each observer stands at a different position, every person sees their own unique rainbow — you literally cannot share a rainbow with another person. The bow shape comes from the geometry: all droplets at 42° from the antisolar point (the shadow of your head) send red light to you simultaneously, forming a circle. Mountains block the lower arc.`,
    wowFact: 'A complete rainbow is actually a full circle — pilots and people on mountain ridges sometimes see the entire ring. The horizon cuts off the bottom half for ground observers.',
    topics: ['physics', 'science'],
    summary: 'Why every rainbow belongs to exactly one person.',
    nextKey: 'red-sunsets',
  },
  {
    key: 'red-sunsets',
    title: 'Why Sunsets Are Red',
    content: `The same Rayleigh scattering that makes the daytime sky blue makes sunsets orange and red. When the Sun is low on the horizon, its light travels through a much longer slice of atmosphere to reach your eyes — sometimes 40 times more air than at noon. By the time it arrives, almost all the blue light has been scattered away in other directions. What remains is the long-wavelength light: orange and red. Exceptionally vivid sunsets often follow major volcanic eruptions. When Mount Pinatubo erupted in 1991, it injected sulfur dioxide into the stratosphere, forming aerosol particles that persisted for years and scattered light with unusual intensity. Painters in the Northern Hemisphere began producing dramatically redder sunsets in the years after the 1883 Krakatoa eruption — a historical record of atmospheric science written in oil paint.`,
    wowFact: 'Edvard Munch\'s "The Scream" was directly inspired by a Krakatoa sunset over Oslo — he described the blood-red sky in his diary and painted it into art history.',
    topics: ['physics', 'science', 'history'],
    summary: 'The sunset is just a blue sky with all the blue scattered away.',
    nextKey: null,
  },

  // ── Evolution (3) ──────────────────────────────────────────────────────────
  {
    key: 'natural-selection',
    title: 'Natural Selection in One Generation',
    content: `Darwin imagined evolution as a slow, geological process. But natural selection can operate astonishingly fast when selection pressure is intense. In 1973, Peter and Rosemary Grant began a decades-long study of Darwin's finches on the Galápagos island of Daphne Major. During a severe drought in 1977, large hard seeds became the only food available. Finches with larger, stronger beaks could crack them; finches with smaller beaks starved. Within one year, the average beak size in the population measurably increased. When rains returned, smaller seeds came back and smaller beaks were again advantageous — the population shifted back. Evolution happening, reversibly, in real time. The Grants won the Kyoto Prize for demonstrating in the wild what Darwin had only theorized: natural selection is a continuous, observable process, not a historical fact.`,
    wowFact: 'The Grants measured and banded over 19,000 individual birds over 40 years — one of the most meticulous field studies in the history of biology.',
    topics: ['biology', 'science'],
    summary: 'How a single drought proved Darwin right in twelve months.',
    nextKey: 'antibiotic-resistance',
  },
  {
    key: 'antibiotic-resistance',
    title: 'How Bacteria Evolve Resistance in Real Time',
    content: `When you take antibiotics, the drug kills most bacteria in your body — but not necessarily all of them. A small fraction may have random mutations that confer partial resistance. Those bacteria survive, reproduce, and pass on their resistance genes. Repeat the prescription a few times, and you've applied selection pressure hard enough to breed a resistant population. This is evolution by natural selection happening inside a single patient over days or weeks. Bacteria also accelerate this through horizontal gene transfer: they can share resistance genes directly with other bacteria of different species, sometimes across genus boundaries. A resistance trait that evolved in one pathogen can spread to a completely unrelated species overnight. The WHO considers antibiotic resistance one of the greatest threats to global health. By 2050, resistant infections could kill more people annually than cancer.`,
    wowFact: 'Scientists grew bacteria in a massive petri dish with a 1,000x antibiotic gradient and filmed them evolving resistance in real time — the video went viral in 2016.',
    topics: ['biology', 'medicine', 'science'],
    summary: 'Every antibiotic prescription is an evolution experiment you might lose.',
    nextKey: 'mrsa',
  },
  {
    key: 'mrsa',
    title: 'MRSA: The Superbug That Hospitals Made',
    content: `MRSA stands for Methicillin-resistant Staphylococcus aureus — a strain of the common skin bacterium Staph aureus that has acquired resistance to nearly all beta-lactam antibiotics, the most common class. Before the antibiotic era, Staph aureus infections were often fatal. Penicillin changed that — until Staph began evolving resistance in the 1940s, within two years of penicillin's first use. The pharmaceutical industry stayed ahead with new antibiotics, but each one created new selection pressure. MRSA emerged in 1961. Today it kills more Americans annually than HIV. Most MRSA infections are acquired in hospitals, where antibiotics are used heavily, surfaces harbor bacteria, and patients are immunocompromised — the perfect conditions for selection. The most alarming development is VRSA: Staphylococcus aureus with resistance to vancomycin, the last-resort antibiotic we held in reserve for decades.`,
    wowFact: 'Honey has been used to treat infected wounds for 4,000 years. Modern research confirms its effectiveness — MRSA strains have never developed resistance to honey because it works through multiple simultaneous mechanisms.',
    topics: ['medicine', 'biology', 'science'],
    summary: 'How overusing antibiotics created a pathogen modern medicine can barely fight.',
    nextKey: null,
  },

  // ── Sound (3) ──────────────────────────────────────────────────────────────
  {
    key: 'how-sound-travels',
    title: 'How Sound Actually Travels',
    content: `Sound is not a thing that moves through space — it's a pattern of compression that moves through matter. When a speaker cone pushes forward, it compresses the air molecules in front of it. Those compressed molecules push the ones next to them, which push the ones next to them. The disturbance propagates outward as a wave of alternating high and low pressure regions. In air at room temperature, this wave travels at 343 m/s — about the speed of a rifle bullet. Sound travels about 4.3 times faster in water and 15 times faster in steel, because those media are denser and less compressible, transmitting pressure changes more efficiently. In a vacuum — no matter — sound cannot travel at all. The iconic "no one can hear you scream in space" is literally correct. Stars explode in total silence from the perspective of any observer outside their atmosphere.`,
    wowFact: 'The loudest sound ever recorded was the 1883 Krakatoa eruption — it ruptured eardrums 40 miles away and was heard 4,800 km away in Australia, nearly one-eighth of Earth\'s circumference.',
    topics: ['physics', 'science'],
    summary: 'Sound is a ripple of pressure, not a flowing substance.',
    nextKey: 'concert-halls',
  },
  {
    key: 'concert-halls',
    title: 'Why Concert Hall Design Is a Physics Problem',
    content: `A concert hall is a musical instrument. The shape, materials, and proportions determine how sound reflects, absorbs, and diffuses — collectively called the hall's acoustics. The most prized quality is "reverberation time": how long a sound persists after the source stops. The ideal RT60 (time for sound to decay by 60 dB) for orchestral music is about 1.8 to 2.2 seconds. Too short and music sounds dry; too long and it becomes muddy. The Vienna Musikverein, widely considered the world's best concert hall, achieves its legendary warmth partly through gilded plaster decorations that scatter sound and wooden parquet floors that absorb bass. Modern halls use computer simulations before construction, but building acoustics remains as much art as science — several expensive 20th-century halls have been retrofitted at enormous cost after acoustic failures at opening night.`,
    wowFact: 'When Carnegie Hall opened in 1891, it was so acoustically poor that conductor Walter Damrosch had to cover the ceiling with burlap to absorb excess reverberation.',
    topics: ['physics', 'science', 'culture'],
    summary: 'The engineering and physics that make a $100 seat sound like magic.',
    nextKey: 'how-ear-works',
  },
  {
    key: 'how-ear-works',
    title: 'How Your Ear Converts Vibration Into Thought',
    content: `Your ear converts physical vibration into electrical nerve signals through a system of escalating mechanical precision. Sound waves enter the ear canal and push the eardrum — a membrane 10mm across — which vibrates. Those vibrations are amplified by three tiny bones (the ossicles): the malleus, incus, and stapes. The stapes taps on a membrane-covered window leading to the cochlea, a fluid-filled spiral tube. Inside the cochlea, the basilar membrane vibrates differently along its length — high frequencies stimulate the base, low frequencies the apex. Hair cells sitting on this membrane convert their bending into electrochemical signals that travel along the auditory nerve to the brain. The entire transduction from air pressure wave to neural signal takes about 8 milliseconds. The brain then interprets these signals as pitch, timbre, and spatial location — a miracle of signal processing achieved by 15,500 hair cells.`,
    wowFact: 'The three ossicle bones are the smallest bones in the human body — the stapes is just 3mm long. They\'re also fully formed at birth, unlike every other bone in the body.',
    topics: ['biology', 'physics', 'science'],
    summary: 'The mechanics of how vibrating air becomes the music you hear.',
    nextKey: null,
  },

  // ── Time (3) ───────────────────────────────────────────────────────────────
  {
    key: 'time-dilation',
    title: 'Time Runs Slower When You\'re Moving Fast',
    content: `Special relativity makes a startling prediction: time passes more slowly for a moving object than for a stationary one. This isn't metaphorical — it's physically measurable. In 1971, scientists flew atomic clocks around the world on commercial jets and compared them to identical clocks left on the ground. The airborne clocks ran slower — by exactly the amount Einstein's equations predicted. GPS satellites experience time about 38 microseconds per day faster than clocks on Earth due to weaker gravity and the time dilation from orbital speed. If engineers didn't continuously correct for this, GPS position errors would accumulate at about 10 km per day. The key insight is that the speed of light is constant for all observers — if you're moving and the photon you emit still travels at c from your perspective, time itself must flex to make that work.`,
    wowFact: 'Twin paradox thought experiment: an astronaut on a 10-year roundtrip near lightspeed could return to find their Earth-bound twin 60 years older — relativity is not science fiction.',
    topics: ['physics', 'science', 'space'],
    summary: 'Why your GPS would be wrong by 10 km per day without Einstein\'s equations.',
    nextKey: 'gps-relativity',
  },
  {
    key: 'gps-relativity',
    title: 'GPS Works Because Einstein Was Right',
    content: `GPS relies on 30+ satellites orbiting at 20,200 km altitude, each carrying atomic clocks accurate to 20 nanoseconds. Your phone measures how long radio signals from four satellites take to arrive, then triangulates your position. But two relativistic effects must be corrected simultaneously. First, special relativity: satellites orbit at 14,000 km/h, so their clocks run slow by 7 microseconds per day. Second, general relativity: they're farther from Earth's gravitational field, which runs clocks faster by 45 microseconds per day. Net effect: satellite clocks run fast by 38 microseconds per day. Light travels 11.4 km in 38 microseconds — so without corrections, positions would drift by 11 km daily. The correction is built into the satellites' atomic clocks before launch. GPS is the most practical real-world test of relativity running continuously, and Einstein has passed every day for decades.`,
    wowFact: 'The GPS satellite clocks are intentionally set slow before launch to compensate for relativistic effects — engineers pre-apply Einstein\'s corrections before the satellites even lift off.',
    topics: ['physics', 'technology', 'science'],
    summary: 'The satellite navigation in your phone only works because time is relative.',
    nextKey: 'what-now-means',
  },
  {
    key: 'what-now-means',
    title: 'What "Now" Actually Means',
    content: `"Now" is an intuitive concept that physics makes philosophically queasy. In special relativity, two events that are simultaneous for one observer may not be simultaneous for another moving observer. This isn't a measurement problem or a light-travel delay — the events genuinely have no universal ordering. Einstein showed that simultaneity is relative: there is no moment that is "now" for the entire universe. When you look at the Sun, you see it as it was 8 minutes ago. When you look at the Andromeda Galaxy, you see it as it was 2.5 million years ago. The "present moment" you observe is not a slice of simultaneous events — it's a cone of past light that reaches your eyes at this instant. Philosophers call this problem the "present moment fallacy." Physicists increasingly think time itself may be an emergent property of thermodynamics, not a fundamental feature of reality.`,
    wowFact: 'The block universe interpretation of physics suggests that past, present, and future all equally exist — time is just another dimension, and "now" is an illusion created by consciousness moving through it.',
    topics: ['physics', 'philosophy', 'science'],
    summary: 'Why physics says there is no universal "now" — only your perspective.',
    nextKey: null,
  },

  // ── Blood (3) ──────────────────────────────────────────────────────────────
  {
    key: 'what-blood-does',
    title: 'What Blood Actually Does',
    content: `Blood is not just a delivery service for oxygen. A single milliliter contains about 5 million red blood cells, 250,000 platelets, and 7,000 white blood cells. Red cells carry oxygen bound to hemoglobin — an iron-containing protein that gives blood its color. But blood also transports carbon dioxide, hormones, nutrients, heat, and immune cells. White blood cells patrol for pathogens, remember past infections, and coordinate multi-cellular immune responses. Platelets carry the clotting machinery that prevents you from bleeding out every time you're scratched. Plasma — the straw-colored liquid that's 55% of blood volume — carries glucose, clotting proteins, antibodies, and hundreds of other molecules. Your 5 liters of blood circulate completely through your body in about 60 seconds at rest. In a single day, your heart pumps roughly 7,000 liters.`,
    wowFact: 'Blood is the only liquid tissue in the human body. It\'s technically an organ — just a liquid one.',
    topics: ['biology', 'medicine', 'science'],
    summary: 'The liquid organ doing dozens of things your body can\'t live without.',
    nextKey: 'blood-types',
  },
  {
    key: 'blood-types',
    title: 'Why Blood Types Exist',
    content: `Blood type is determined by which antigens — proteins and sugar chains — decorate the surface of your red blood cells. ABO blood types come from two antigens (A and B). Type A has A antigens and anti-B antibodies. Type B has the reverse. Type AB has both antigens and no antibodies. Type O has neither antigen and both antibodies. The antibodies are the problem: transfuse the wrong type and the immune system attacks the donated cells, causing a potentially fatal hemolytic reaction. The ABO system exists because these antigens aren't unique to blood cells — they're on many cell surfaces, and foreign ABO antigens trigger an immune response that evolved for fighting pathogens, not blood transfusions. The Rh factor (+ or -) is a separate protein: Rh+ individuals have it, Rh- individuals don't. Blood type O-negative is the universal donor because it lacks both systems of antigens.`,
    wowFact: 'The reason you have blood type O if your parents were types A and B, or both A, depends on which variant of a single gene you inherited from each parent — blood type is controlled by just three gene variants.',
    topics: ['biology', 'medicine', 'science'],
    summary: 'Why the wrong blood transfusion can kill you — and what your blood type really means.',
    nextKey: 'vaccines',
  },
  {
    key: 'vaccines',
    title: 'How Vaccines Trick Your Immune System',
    content: `Your immune system has two layers: innate immunity (fast, non-specific) and adaptive immunity (slow, but perfectly targeted). Adaptive immunity forms memory cells after each infection — the next encounter with that pathogen triggers a massive, rapid response before symptoms develop. Vaccines exploit this memory system by introducing a harmless version of a pathogen: killed virus, weakened virus, a surface protein fragment, or in the case of mRNA vaccines, instructions for making a surface protein. Your immune system responds, forms memory cells, and forgets about it. Years later, when the real pathogen arrives, the memory cells are primed for immediate attack. mRNA vaccines (Pfizer, Moderna) are novel because they deliver genetic instructions rather than proteins. The mRNA degrades within days. Nothing is inserted into your DNA — the mRNA never enters the nucleus. It's read in the cytoplasm, the protein is made, and the immune system does the rest.`,
    wowFact: 'Smallpox killed an estimated 300 million people in the 20th century alone — then was completely eradicated in 1980 through vaccination. It remains the only human disease ever deliberately wiped off Earth.',
    topics: ['medicine', 'biology', 'science'],
    summary: 'The immunological trick that has saved more lives than any other medical intervention.',
    nextKey: null,
  },

  // ── Fire (3) ───────────────────────────────────────────────────────────────
  {
    key: 'what-fire-is',
    title: 'What Fire Actually Is',
    content: `Fire is not a substance — it's a chemical reaction. Specifically, it's rapid oxidation: fuel molecules react with oxygen to produce carbon dioxide, water, and heat. The heat sustains the reaction by maintaining the temperature needed for molecules to collide with enough energy to keep breaking bonds. The flame itself — the visible part — is hot gas containing excited molecules and carbon particles (soot) that glow as they heat up. Different fuel types produce different colors: blue flames contain hot ionized gas; yellow flames contain glowing soot particles; green flames indicate copper compounds burning. Fire requires three things simultaneously: fuel, oxygen, and heat (the "fire triangle"). Remove any one and the reaction stops. That's why CO2 fire extinguishers work — they displace oxygen. That's why fire blankets work — they block oxygen. That's why cooling works — it drops temperature below ignition threshold.`,
    wowFact: 'In microgravity, flames are perfectly spherical and blue — there\'s no convection to carry hot gases upward, so a candle flame on the ISS looks nothing like a flame on Earth.',
    topics: ['physics', 'chemistry', 'science'],
    summary: 'Fire is an ongoing chemical reaction, not a thing — and understanding it changed civilization.',
    nextKey: 'how-stars-burn',
  },
  {
    key: 'how-stars-burn',
    title: 'How Stars Burn (It\'s Not Like Fire)',
    content: `Stars don't burn in the chemical sense. The Sun generates energy through nuclear fusion: protons (hydrogen nuclei) collide with enough force to overcome their mutual electromagnetic repulsion and fuse into helium. Each fusion reaction converts a tiny amount of mass directly into energy via E=mc². The Sun converts 620 million tonnes of hydrogen into 616 million tonnes of helium every second — the missing 4 million tonnes becomes energy. Because c² is enormous (9×10¹⁶ m²/s²), even tiny mass conversions release staggering energy. The Sun has been doing this for 4.6 billion years and has enough hydrogen for another 5 billion. The fusion happens at the Sun's core under extreme conditions: 15 million°C temperature and pressure 250 billion times greater than Earth's atmosphere. Fusion energy is the goal of projects like ITER — humanity trying to build a small star on Earth.`,
    wowFact: 'A single gram of hydrogen fuel undergoing fusion releases about 100 billion joules — equivalent to burning 85 tonnes of coal.',
    topics: ['physics', 'space', 'science'],
    summary: 'Stars run on nuclear fusion — a process fundamentally different from any fire on Earth.',
    nextKey: 'sun-wont-explode',
  },
  {
    key: 'sun-wont-explode',
    title: 'Why the Sun Won\'t Explode',
    content: `When stars die, how they die depends entirely on their mass. The Sun is a low-mass star. In about 5 billion years, it will exhaust its hydrogen fuel. Without the outward pressure of fusion, gravity will compress the core while the outer layers expand into a red giant — swallowing Mercury, Venus, and possibly Earth. The core then contracts to a white dwarf: an Earth-sized ember of carbon and oxygen slowly cooling over billions of years. No explosion. Massive stars — those 8 times the Sun's mass or larger — die differently. When their iron cores collapse in milliseconds, the outer layers bounce off the rigid core and detonate in a supernova: briefly outshining entire galaxies. A neutron star or black hole remains. The carbon in your body, the calcium in your bones, the iron in your blood — all of it was forged in long-dead stars and scattered by their explosions. You are literally made of star stuff.`,
    wowFact: 'The gold in your jewelry was almost certainly created not in a supernova but in a neutron star collision — only the extreme violence of two neutron stars merging creates conditions dense enough to forge heavy elements like gold and platinum.',
    topics: ['physics', 'space', 'science'],
    summary: 'The Sun dies quietly. It\'s the big stars that go out with a bang.',
    nextKey: null,
  },

  // ── Money (3) ──────────────────────────────────────────────────────────────
  {
    key: 'gold-as-money',
    title: 'Why Gold Became Money',
    content: `Money has five properties: portability, divisibility, durability, scarcity, and recognizability. Gold satisfies all five better than almost any other substance. You can melt it, divide it precisely, and it doesn't corrode. Its scarcity is geological: all the gold ever mined in human history would fill roughly 3.7 Olympic swimming pools. Its recognizability is physical: gold's luster, density, and malleability are unmistakable. Salt, grain, cattle, and shells all served as money in various cultures, but each fails on at least one criterion — grain rots, cattle aren't portable, salt dissolves. Cowrie shells were used as currency across Asia and Africa for 4,000 years, but Europeans could manufacture them cheaply, destroying their scarcity. Gold's scarcity is enforced not by social contract but by nuclear physics — gold can only be created in neutron star collisions, making it genuinely irreproducible.`,
    wowFact: 'Only about 190,000 tonnes of gold have ever been mined. At current prices, all of it is worth roughly $13 trillion — less than the United States GDP for a single year.',
    topics: ['economics', 'history'],
    summary: 'Why physics, chemistry, and geology conspired to make one element the universal currency.',
    nextKey: 'inflation',
  },
  {
    key: 'inflation',
    title: 'What Inflation Actually Is',
    content: `Inflation is not prices going up. It's the purchasing power of money going down. The distinction matters because prices rise for many reasons: supply shocks, demand surges, monopoly pricing. Inflation is specifically the general, sustained decline in what a unit of currency can buy — and it's caused primarily by the money supply growing faster than the economy's output. When governments print money faster than goods and services are produced, each unit of currency represents a smaller share of real wealth. The classic example is Weimar Germany (1921-23): the government printed money to pay war debts, triggering hyperinflation so extreme that a wheelbarrow of cash couldn't buy a loaf of bread. Modern central banks target 2% annual inflation as a deliberate policy — enough to discourage hoarding cash and encourage economic activity, not so much to distort price signals. The tradeoff: inflation acts as a silent tax on savers.`,
    wowFact: 'Zimbabwe\'s 2008 hyperinflation peaked at an estimated 89.7 sextillion percent per month — the central bank issued a $100 trillion note that couldn\'t buy a bus ticket.',
    topics: ['economics', 'history'],
    summary: 'Why governments intentionally make your money worth less every year.',
    nextKey: 'compound-interest',
  },
  {
    key: 'compound-interest',
    title: 'How Compound Interest Works (and Why It\'s Violent)',
    content: `Simple interest earns the same fixed amount each period. Compound interest earns interest on your interest — and the difference is staggering. $1,000 at 7% simple interest for 40 years yields $3,800. At 7% compound interest, it yields $14,974. The Rule of 72 is a shortcut: divide 72 by your interest rate to find how many years to double. At 7%, money doubles in ~10 years. At 3%, it takes 24. The mechanism is geometric growth — the base keeps growing, so each period's gain is larger than the last. This works in reverse for debt: credit card debt at 24% APR doubles in 3 years. A $5,000 credit card balance ignored for 10 years becomes $44,000. Einstein allegedly called compound interest the "eighth wonder of the world" — the math doesn't care whether you're on the earning or paying end, it will be ruthlessly consistent either way.`,
    wowFact: 'If someone had invested $1,000 at 10% annual interest in the year 1000 CE, the investment would be worth more than all the money in existence today.',
    topics: ['economics', 'mathematics'],
    summary: 'The mathematical force that quietly builds (or destroys) wealth over decades.',
    nextKey: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function insertPost(card: CardDef): Promise<string> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: card.title,
      content: card.content,
      summary: card.summary,
      wow_fact: card.wowFact,
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(`Insert failed for "${card.title}": ${error.message}`);
  return data.id as string;
}

async function insertTopics(postId: string, topics: string[]): Promise<void> {
  if (topics.length === 0) return;
  const { error } = await supabase
    .from('post_topics')
    .insert(topics.map(topic => ({ post_id: postId, topic })));
  if (error) console.warn(`Topics insert warning for ${postId}: ${error.message}`);
}

async function wireChain(postId: string, relatedPostId: string, relatedTitle: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({ related_post_id: relatedPostId, related_post_title: relatedTitle })
    .eq('id', postId);
  if (error) throw new Error(`Chain update failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Seeding ${CARDS.length} learn cards...`);

  // Pass 1 — insert all posts
  const keyToId = new Map<string, string>();
  for (const card of CARDS) {
    const id = await insertPost(card);
    await insertTopics(id, card.topics);
    keyToId.set(card.key, id);
    console.log(`  ✓ [${card.key}] → ${id}`);
  }

  // Pass 2 — wire chain links
  let chained = 0;
  for (const card of CARDS) {
    if (!card.nextKey) continue;
    const currentId = keyToId.get(card.key);
    const nextId = keyToId.get(card.nextKey);
    const nextCard = CARDS.find(c => c.key === card.nextKey);
    if (!currentId || !nextId || !nextCard) {
      console.warn(`  ⚠ Could not wire chain ${card.key} → ${card.nextKey}`);
      continue;
    }
    await wireChain(currentId, nextId, nextCard.title);
    console.log(`  ⇒ ${card.key} → ${card.nextKey}`);
    chained++;
  }

  console.log(`\nDone! ${CARDS.length} posts inserted, ${chained} chain links wired.`);
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
