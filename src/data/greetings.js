// Biblical identity statements and greeting templates for Band of Brothers
// Rotates through different greetings each time user logs in

export const identityStatements = [
  {
    identity: "Servant of the King",
    template: "Welcome {name}, {identity}."
  },
  {
    identity: "Dangerous for Good",
    template: "{name}, you are {identity}, let's go!"
  },
  {
    identity: "More Than a Conqueror",
    template: "{name}, you are {identity}, ready?"
  },
  {
    identity: "Warrior for Christ",
    template: "Welcome {name}, {identity}."
  },
  {
    identity: "Fighter in the Faith",
    template: "{name}, you are a {identity}, let's go!"
  },
  {
    identity: "Champion of Hope",
    template: "{name}, you are a {identity}, ready?"
  },
  {
    identity: "Son of God",
    template: "Welcome {name}, {identity}."
  },
  {
    identity: "Child of the Most High",
    template: "{name}, you are a {identity}, let's go!"
  },
  {
    identity: "Masterpiece of Creation",
    template: "{name}, you are a {identity}, ready?"
  },
  {
    identity: "Victor in Christ",
    template: "Welcome {name}, {identity}."
  },
  {
    identity: "Ambassador of Christ",
    template: "{name}, you are an {identity}, let's go!"
  },
  {
    identity: "Chosen and Called",
    template: "{name}, you are {identity}, ready?"
  },
  {
    identity: "Overcomer",
    template: "Welcome {name}, {identity}."
  },
  {
    identity: "Light in the Darkness",
    template: "{name}, you are {identity}, let's go!"
  },
  {
    identity: "Strong and Courageous",
    template: "{name}, you are {identity}, ready?"
  }
];

// Get the next greeting based on the last index shown
export const getNextGreeting = (firstName, lastGreetingIndex) => {
  // If lastGreetingIndex is null or undefined, start at 0
  const currentIndex = lastGreetingIndex !== null && lastGreetingIndex !== undefined
    ? lastGreetingIndex
    : -1;

  // Get next index (wrap around to 0 if at end)
  const nextIndex = (currentIndex + 1) % identityStatements.length;

  const greeting = identityStatements[nextIndex];
  const name = firstName || 'Brother';

  // Replace {name} and {identity} in template
  const message = greeting.template
    .replace('{name}', name)
    .replace('{identity}', greeting.identity);

  return {
    message,
    nextIndex
  };
};
