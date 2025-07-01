const leftSideDiv = document.getElementById('below'); 
const rightSideDiv = document.getElementById('secondary');

const idMapLeft = new Map();
const idMapRight = new Map([['#companion', 'advertisement'], ['#panels', 'advertisement'], ['#scroll-container', 'relevant suggestion headers']]);


function removeByIdLeft(id) {
    const testDiv = leftSideDiv.querySelector(id);
}

function removeByIdRight(id) {
    const testDiv = rightSideDiv.querySelector(id);

    if (testDiv) {
        testDiv.remove();
        console.log(`Tag with id '${id}' (which is an ${idMapRight[id]}) has been removed.`);
    } else {
        console.log(`Tag with id '${id}' (which is an ${idMapRight[id]}) could not be found.`);
    }
}

removeByIdRight('#panels')
