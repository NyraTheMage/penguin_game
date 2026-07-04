const menu = fnBar // from new_fn_bar.js
const popText = popupText// from new_fn_bar.js
var environment_img = 0

console.log("js loaded")



const RECIPE_MODEL = {
    "garden": {
        "plastic": 10,
        "beach_shovel": 1,
        "polluted_mud":5
    },
    "visitor_lodge": {
        "fishing_net": 100,
        "traffic_cone": 3
    },
    "hammock": {
        "fishing_net": 5,
        "coconut": 2,
        "sunglasses":1
    },
    "rain_collector":{
        "metal":3,
        "plastic":5
    }
    
};

const ROOM_IMAGE_MODEL = {
    "garden": "room3",
    "visitor_lodge":"room1",
    "hammock":"room4",
    "rain_collector":"room2"
}


const RESOURCE_MODEL = [
    {
        name: "plastic",
        description: "bottle and wrappers etc",
        rarity: 1
    },
    {
        name: "metal",
        description: "aluminium can",
        rarity: 2
    },
    {
        name: "fishing_net",
        description: "catching innocent fish",
        rarity: 1
    }
    ,
    {
        name: "polluted_mud",
        description: "muddy",
        rarity: 2
    }
    ,
    {
        name: "coconut",
        description: "it's a coco-fruit",
        rarity: 3
    }
    ,
    {
        name: "beach_shovel",
        description: "good for planting things",
        rarity: 3
    }
    ,

    {
        name: "radioactive_trout",
        description: "looks ... delicious?",
        rarity: 4
    }
    ,
    {
        name: "traffic_cone",
        description: "regulating underwater traffic",
        rarity: 3
    }
    ,
    {
        name: "sunglasses",
        description: "stylish",
        rarity: 3
    }
    ,

    {
        name: "drowned_phone",
        description: "Rice won't fix this.",
        rarity: 4
    }
    ,

    {
        name: "golden_flip-flop",
        description: "Its mate is priceless.",
        rarity: 5
    }
    ,
    {
        name: "bleh",
        description: "Lorem Ipsum I want to sleep",
        rarity: 5
    },
];

let reverse_recipe_model;
let discovered_recipes;
let made_recipes = []
let discovered_resources = [];


// ============================================================
// Call once when the game starts.
// ============================================================

function initialiseGame() {
    reverse_recipe_model = createReverseRecipeModel();
    resources_by_rarity = createResourcesByRarity();

    discovered_recipes = [];

    console.log("reverse_recipe_model:")
    console.log(reverse_recipe_model)

    console.log("resources_by_rarity:")
    console.log(resources_by_rarity)

}




// CHUNK1

// ============================================================
// Builds:
// {
//     "Plastic": ["Net", "Boat"],
//     "Metal": ["Net"],
//     "Wood": ["Boat"]
// }
// from RECIPE_MODEL
// ============================================================

function createReverseRecipeModel() {
    const output = {};

    for (const recipeName in RECIPE_MODEL) {
        const ingredients = RECIPE_MODEL[recipeName];

        for (const ingredientName in ingredients) {
            if (!output.hasOwnProperty(ingredientName)) {
                output[ingredientName] = [];
            }

            output[ingredientName].push(recipeName);
        }
    }

    return output;
}


// ============================================================
// Inventory
// ============================================================

class InventoryClass {
    constructor() {
        this._store = {};
    }

    add(resourceName, amt = 1) {
        if (!this._store.hasOwnProperty(resourceName)) {
            this._store[resourceName] = 0;
        }

        this._store[resourceName] += amt;
        return true;
    }

    use(resourceName, amt = 1) {
        if (this.quantityOf(resourceName) < amt) {
            return false;
        }

        this._store[resourceName] -= amt;

        if (this._store[resourceName] === 0) {
            delete this._store[resourceName];
        }

        return true;
    }

    useMany(resources) {
	    // First check that we have enough of everything
	    for (const [resourceName, amt] of Object.entries(resources)) {
	        if (this.quantityOf(resourceName) < amt) {
	            console.log(`Tried to use ${amt} ${resourceName} but don't have enough.`);
	            return false;
	        }
	    }

	    // Then remove everything
	    for (const [resourceName, amt] of Object.entries(resources)) {
	        this._store[resourceName] -= amt;

	        if (this._store[resourceName] === 0) {
	            delete this._store[resourceName];
	        }

	        console.log(`Used ${amt} ${resourceName}`);
	    }

	    return true;
	}

    quantityOf(resourceName) {
        return this._store[resourceName] ?? 0;
    }

    print(){
    	console.log(this._store)
    }
}

const inventory = new InventoryClass();


// ============================================================
// DROPS
// ============================================================

// ============================================================
// Controls expected drop rates.
// Out of every 1000 clicks, expect approximately:
// Rarity 1: 600
// Rarity 2: 250
// Rarity 3: 100
// Rarity 4: 40
// Rarity 5: 10
// ============================================================

const RARITY_WEIGHTS_POLLUTED = {
    1: 7000,
    2: 2000,
    3: 500,
    4: 200,
    5: 1
};

let rarity_weights = RARITY_WEIGHTS_POLLUTED;


// ============================================================
// Built once at startup.
// Key = rarity.
// Value = Array of Resources with that rarity.
// ============================================================

let resources_by_rarity = {};

function createResourcesByRarity() {
    const output = {};

    for (const resource of RESOURCE_MODEL) {
        const rarity = resource.rarity;

        if (!output.hasOwnProperty(rarity)) {
            output[rarity] = [];
        }

        output[rarity].push(resource);
    }

    return output;
}


// ============================================================
// Returns one random Resource.
// ============================================================

function getRandomResource() {
    let totalWeight = 0;

    for (const weight of Object.values(rarity_weights)) {
        totalWeight += weight;
    }

    let roll = Math.floor(Math.random() * totalWeight) + 1;

    let chosenRarity = 1;

    for (const rarity in rarity_weights) {
        roll -= rarity_weights[rarity];

        if (roll <= 0) {
            chosenRarity = rarity;
            break;
        }
    }

    const resources = resources_by_rarity[chosenRarity] ?? [];

    if (resources.length === 0) {
        return null;
    }

    return resources[Math.floor(Math.random() * resources.length)];
}


// ============================================================
// Returns every recipe newly fulfilled by this resource.
// ============================================================

function getFulfilledRecipes(resource) {
    const unlocked = [];

    if (!reverse_recipe_model.hasOwnProperty(resource.name)) {
        return unlocked;
    }

    for (const recipeName of reverse_recipe_model[resource.name]) {
        const ingredients = RECIPE_MODEL[recipeName];

        const requiredAmount = ingredients[resource.name];

        if (inventory.quantityOf(resource.name) !== requiredAmount) {
            continue;
        }

        let fulfilled = true;

        for (const ingredientName in ingredients) {
            if (ingredientName === resource.name) {
                continue;
            }

            if (inventory.quantityOf(ingredientName) < ingredients[ingredientName]) {
                fulfilled = false;
                break;
            }
        }

        if (fulfilled) {
            unlocked.push(recipeName);
        }
    }

    return unlocked;
}


// ============================================================
// Returns whether the player can currently make a recipe.
// ============================================================

function hasResourcesForRecipe(recipeName) {
    if (!RECIPE_MODEL.hasOwnProperty(recipeName)) {
        return false;
    }

    const ingredients = RECIPE_MODEL[recipeName];

    for (const ingredientName in ingredients) {
        if (Inventory.quantityOf(ingredientName) < ingredients[ingredientName]) {
            return false;
        }
    }

    return true;
}


// CHUNK3

// ============================================================
// Event: Workshop clicked.
// Displays all discovered recipes.
// ============================================================

function onWorkshopClicked() {
    cursor = "workshop";

    let text = "";

    for (let i = 0; i < discovered_recipes.length; i++) {
        const recipeName = discovered_recipes[i];

        let canMake = "NO";
        if (hasResourcesForRecipe(recipeName)) {
            canMake = "YES";
        }

        text += `${i + 1}. ${recipeName} - ${canMake}\n`;
    }

    printText(text);
}


// ============================================================
// Event: Recipe selected.
// ============================================================

function onRecipeClicked(cursor, recipeName) {
    cursor = recipeName;

    let text = `${recipeName}\n\n`;

    const ingredients = RECIPE_MODEL[recipeName];

    for (const ingredientName in ingredients) {
        text += `${ingredientName} ${Inventory.quantityOf(ingredientName)}/${ingredients[ingredientName]}\n`;
    }

    text += "\n";

    if (hasResourcesForRecipe(recipeName)) {
        text += "Make recipe?";
    } else {
        text += "(Not enough resources)";
    }

    printText(text);
}


// ============================================================
// Event: Ocean clicked.
// ============================================================

function onOceanClicked(_lv) {
    const resource = getRandomResource();


    if (resource != null) {
        onGotResource(resource);
    } else {
    	console.log("ERROR: onOceanClicked did not get resource")
    }


    if (discovered_resources.includes(resource)){
        popText.fast(getResourceUIText(resource.name,1))
    } else {
        discovered_resources.push(resource)
        popText.setHeader (`found ${resource.name}`)
        popText.setBody (resource.description)
        popText.show()
    }

    let fulfilled = getFulfilledRecipes(resource)

    for (let i=0;i<fulfilled.length;i++){
        console.log(discovered_recipes)
        console.log(fulfilled[i])
        if (!discovered_recipes.includes(fulfilled[i])){

            discovered_recipes.push(fulfilled[i]);
            popupText.setHeader("RECIPE DISCOVERED")
            popupText.setBody(fulfilled[i])
            popText.show()
        }
    }
    
}




// ============================================================
// Event: Player obtained a resource.
// ============================================================

function onGotResource(resource) {
    let retText = "";

    inventory.add(resource.name);



    retText += `You got 1 ${resource.name}.`;

}

function getResourceUIText(resource_name, amt){
	return `+ ${amt}  ${resource_name}`
}






function print_info(){
	console.log("===================")
	console.log("inventory")
	console.log(inventory._store)
	console.log("-------------------")
	console.log("recipes")
	console.log(discovered_recipes)
	console.log("-------------------")


	console.log("===================")

}



function test1 (){

	initialiseGame()

	print_info()

	onOceanClicked()
	onOceanClicked()
	onOceanClicked()
	onOceanClicked()
	onOceanClicked()


	machine1.run()



	machine1.run()
	machine1.run()
	machine1.run()


	machine1.upgrade() 



	machine2.run()
	machine2.run()
	machine2.run()
	machine2.run()



	machine2.run()
	machine2.run()
	machine2.run()
	machine2.run()


	print_info()
	machine2.upgrade() 
	print_info()


}


// 20260701
var oceanElem = document.getElementById("divC");


oceanElem.addEventListener("click", ()=>{
	onOceanClicked()

})


var recipeMenu = document.getElementById("recipes")

function buildRoom( req , roomName){
    console.log(ROOM_IMAGE_MODEL[roomName])
    if (inventory.useMany(req) == true){

        //show the image
        console.log(ROOM_IMAGE_MODEL[roomName])
        document.getElementById(ROOM_IMAGE_MODEL[roomName]).style.display="block"

        //improve the background
        environment_img += 0.25
        if (environment_img>1){environment_img=1}
        document.getElementById("background2").style.opacity = environment_img

        made_recipes.push(roomName)
        return true
    } else {
        return false
    }
}

function generateReciptes(){
    let ret = []

    for (const [name, requirements] of Object.entries(RECIPE_MODEL)) {
        
        if (discovered_recipes.includes(name) && !made_recipes.includes(name)){
            console.log(name)
            text = name.toUpperCase()
        

            for (const [resourceName, amt] of Object.entries(requirements)){
                text += "<br>"
                text += resourceName + ": "
                text += inventory.quantityOf(resourceName) + "/"
                text += amt
            }
            

            ret.push( [text, ()=>{ 
                if (buildRoom(requirements, name)== false){
                    popText.fast("Not enough resources")
                } else {
                    menu.hide()
                }
            }])  
        }
        
    }


    return ret
}

function onShowMenu(){
    menu.show( generateReciptes() )
}

function setup(){
	menu.hide()
	popupText.init()


    recipeMenu.addEventListener("click", ()=> onShowMenu())

	initialiseGame()

    document.getElementById('imageHolder').addEventListener("click", (event)=>{
        if (event.target.closest("a")) {
            return; // let the browser handle the link
        }
        onOceanClicked()
    })
}
setup()


function fastClick(num){


    for (let i=0;i<num;i++){
        onOceanClicked()
    }
    console.log("=======================")
    console.log("\n INVENTORY")
    inventory.print()
    console.log("-----------------------")
    console.log("\n DISCOVERED RECIPES")
    console.log(discovered_recipes)
    console.log("-----------------------")
    console.log("\n DISCOVERED RESOURCES")
    console.log(discovered_resources)
    console.log("-----------------------")
    console.log("\n REVERSE RECIPES")
    console.log(reverse_recipe_model)
    console.log("-----------------------")
    console.log("=======================")
}


