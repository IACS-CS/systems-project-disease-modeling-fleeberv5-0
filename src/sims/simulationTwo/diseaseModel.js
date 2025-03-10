import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, you should model a *real world disease* based on some real information about it.
*
* Options are:
* - Mononucleosis, which has an extremely long incubation period.
*
* - The flu: an ideal model for modeling vaccination. The flu evolves each season, so you can model
    a new "season" of the flu by modeling what percentage of the population gets vaccinated and how
    effective the vaccine is.
* 
* - An emerging pandemic: you can model a new disease (like COVID-19) which has a high infection rate.
*    Try to model the effects of an intervention like social distancing on the spread of the disease.
*    You can model the effects of subclinical infections (people who are infected but don't show symptoms)
*    by having a percentage of the population be asymptomatic carriers on the spread of the disease.
*
* - Malaria: a disease spread by a vector (mosquitoes). You can model the effects of the mosquito population
    (perhaps having it vary seasonally) on the spread of the disease, or attempt to model the effects of
    interventions like bed nets or insecticides.
*
* For whatever illness you choose, you should include at least one citation showing what you are simulating
* is based on real world data about a disease or a real-world intervention.
*/

/**
 * Authors:
 *
 * What we are simulating: The Flu
 *
 * What we are attempting to model from the real world: Deaths, Immunity & Length of Sickness
 *
 * What we are leaving out of our model: Quarantine
 *
 * What elements we have to add: Handshake, Infection
 *
 * What parameters we will allow users to "tweak" to adjust the model: Length of Immunity, Length of Sickness
 *
 * In plain language, what our model does: Simulates the spread of the flu through a population, tracking infection rates, duration of sickness, and immunity.
 */

// Default parameters -- any properties you add here
// will be passed to your disease model when it runs.

export const defaultSimulationParameters = {
  infectionChance: 50,
  deathPercentage: 4.7,
  immunity: 5,
  sickDays: 7,
};

/* Creates your initial population. By default, we *only* track whether people
are infected. Any other attributes you want to track would have to be added
as properties on your initial individual. 

For example, if you want to track a disease which lasts for a certain number
of rounds (e.g. an incubation period or an infectious period), you would need
to add a property such as daysInfected which tracks how long they've been infected.

Similarily, if you wanted to track immunity, you would need a property that shows
whether people are susceptible or immune (i.e. succeptibility or immunity) */
export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize, // X-coordinate within 100 units
      y: (100 * Math.floor(i / sideSize)) / sideSize, // Y-coordinate scaled similarly
      infected: false,
      dead: false,
      sickDays: 0,
      immune: false,
      immunity: 0,
    });
  }
  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  patientZero.sickDays = 1;
  return population;
};

const maybeInfectPerson = (person, params) => {
  if (Math.random() * 100 < params.infectionChance) {
    if (!person.infected && !person.dead && person.immunity === 0) {
      person.infected = true;
      person.newlyInfected = true;
    }
  }
};

// Example: Update population (students decide what happens each turn)
export const updatePopulation = (population, params) => {
  // First, no one is newly infected any more...
  for (let p of population) {
    p.newlyInfected = false;
    if (p.dead) {
      p.sickDays = 0; // Reset sick days for dead people
      p.immunity = 0;
      p.immune = false; // Reset immunity for dead people
      p.infected = false; // Reset infection for dead people
      continue; // Skip dead people
    }
    if (p.infected) {
      p.sickDays++;
    }
    if (p.immune) {
      p.infected = false; // Reset infection for immune people
      p.sickDays = 0; // Reset sick days for immune people
      p.immunity++;
      p.immune = true;
      if (p.immunity > params.immunity) {
        p.immune = false;
        p.immunity = 0;
      }
    }
    if (p.sickDays > params.sickDays) {
      p.infected = false;
      p.sickDays = 0;
      p.immunity = 1;
      p.immune = true;
    }
    if (p.infected && Math.random() * 100 < params.deathPercentage) {
      p.sickDays = 0; // Reset sick days for dead people
      p.immunity = 0; // Reset immunity for dead people
      p.infected = false; // Reset infection for dead people
      p.dead = true;
    }
  }
  // const shuffledPopulation = shufflePopulation(population);
  const notDeadShuffled = shufflePopulation(population.filter((p) => !p.dead));
  // Now that we've shuffled, let's move through the population by two's
  for (let i = 0; i < notDeadShuffled.length - 1; i += 2) {
    let personA = notDeadShuffled[i];
    let personB = notDeadShuffled[i + 1];

    // let's have them meet at person A's spot...
    // Check if we're at the edge...
    // Keep track of partners for nudging...
    personA.partner = personB;
    personB.partner = personA;

    // Now let's see if they infect each other
    if (personA.infected && !personB.infected) {
      maybeInfectPerson(personB, params);
    }
    if (personB.infected && !personA.infected) {
      maybeInfectPerson(personA, params);
    }
  }

  // We return the original population (order unchanged)
  return population;
};

// Stats to track (students can add more)
// Any stats you add here should be computed
// by Compute Stats below
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Immune", value: "immune" },
  { label: "Total Dead", value: "dead" },
];

// Example: Compute stats (students customize)
export const computeStatistics = (population, round) => {
  let infected = 0;
  let immune = 0;
  let dead = 0;
  for (let p of population) {
    if (p.infected) {
      infected += 1; // Count the infected
    }
    if (p.immune) {
      immune += 1; // Count the immune
    }
    if (p.dead) {
      dead += 1; // Count the dead
    }
  }
  return { round, infected, immune, dead };
};
