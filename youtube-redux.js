// Separate the right and left panels of the YouTube video player into two separate variables
const leftSideDiv = document.getElementById('below'); 
const rightSideDiv = document.getElementById('secondary');

// Map the tag ids with what they practically represent in the YouTube player 
const idMapLeft = new Map([
    ['#comments', 'comments']
]);
const idMapRight = new Map([
    ['#companion', 'advertisement'], 
    ['#panels', 'advertisement'], 
    ['#scroll-container', 'relevant suggestion headers'],
    ['#contents', 'suggested content for more watching']
]);

// Easy list for directions to use
let directions = ["right", "left"]

// Functions that allow for easy removal of sections on the YouTube player, based on the direction and id passed in as an arguments  
function removeById(direction, id) {
    let testDiv;
    let testMap;

    if (direction === "left") { testDiv = leftSideDiv.querySelector(id); testMap = idMapLeft; }
    else if (direction === "right") { testDiv = rightSideDiv.querySelector(id); testMap = idMapRight; }
    else { console.log(`Please enter in either right or left as your direction argument!`); return; }

    if (testDiv) {
        testDiv.remove();
        console.log(`Tag with id '${id}' (${testMap.get(id)}) has been removed.`);
    } else {
        console.log(`Tag with id '${id}' (${testMap.get(id)}) could not be found.`);
    }
}

// Function that allows for the removal of every section on a specified direction of the YouTube player
function removeSectionsByMap(direction) {
    let selectedMap;

    if (direction === "left") { selectedMap = idMapLeft; }
    else if (direction === "right") { selectedMap = idMapRight; }
    else { console.log(`Please enter in either right or left as your direction argument!`); return; }

    for (const key of selectedMap.keys()) {
        removeById(direction, key);
    }
}

// Concrete function call to remove all the sections specified in both the left and right id maps 
for (const direction of directions) {
    removeSectionsByMap(direction)
}

/*
// Remove the whole right sided panel if there is no queue in use
const queueCheckDiv = rightSideDiv.querySelector('#container'); 
if (!queueCheckDiv) {
    console.log(`No queue found, removing entire right side panel…`)
    rightSideDiv.remove(); 
}
*/
