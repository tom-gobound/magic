const dataModules = {
  'boysBasketballTeams.js': () => import('../data/boysBasketballTeams.js')
    .then(module => ({ teams: module.boysBasketballTeams.teams })),
  'boysBasketballTeamRankings.js': () => import('../data/boysBasketballTeamRankings.js')
    .then(module => ({ rankings: module.boysBasketballTeamRankings.rankings })),
  'staff.js': () => import('../data/staff.js')
    .then(module => ({ staff: module.staff.staff })),
  'games.js': () => import('../data/games.js')
    .then(module => ({ games: module.games.games })),
  'rosters.js': () => import('../data/rosters.js')
    .then(module => ({ rosters: module.rosters.rosters }))
};

export async function readDataFiles() {
  // Return the mapping of available data files
  return Object.keys(dataModules).reduce((acc, filename) => {
    acc[filename] = null; // Initially null, will be loaded on demand
    return acc;
  }, {});
}

export async function loadSelectedData(selectedFiles) {
  const loadedData = {};
  
  await Promise.all(
    selectedFiles.map(async (filename) => {
      if (dataModules[filename]) {
        const moduleData = await dataModules[filename]();
        Object.assign(loadedData, moduleData);
      }
    })
  );
  
  return loadedData;
}