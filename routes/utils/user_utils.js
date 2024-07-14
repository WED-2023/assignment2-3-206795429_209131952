const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${username}',${recipe_id})`);
}

async function removeFavorite(username, recipe_id) {
    const result = await DButils.execQuery(`DELETE FROM FavoriteRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
    if (result.affectedRows === 0) {
        throw new Error("Recipe not found in favorites");
    }
}

async function getFavoriteRecipes(username){
    const recipes  = await DButils.execQuery(`select recipe_id from FavoriteRecipes where username='${username}'`);
    if (recipes.length === 0) {
        throw new Error("There are no favorite recipes");
    }
    return recipes ;
}

// async function addMyRecipe(username, recipe_id, title, image, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, summary, instructions) {
//     const query = `INSERT INTO myrecipes (username, recipe_id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, summary, instructions) 
//                    VALUES ('${username}', ${recipe_id}, '${title}', ${readyInMinutes}, '${image}', ${aggregateLikes}, ${vegan ? 1 : 0}, ${vegetarian ? 1 : 0}, ${glutenFree ? 1 : 0}, '${summary}', '${instructions}')`;
//     try {
//         await DButils.execQuery(query);
//         return { success: true, message: "Recipe successfully added to MyRecipes." };
//     } catch (error) {
//         console.error("SQL Error: ", error.message);
//         return { success: false, message: error.message };
//     }
// }

async function addMyRecipe(username, title, image, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, summary) {
    const query = `INSERT INTO myrecipes (username, title, image, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, summary) 
                   VALUES ('${username}', '${title}', '${image}', ${readyInMinutes}, ${aggregateLikes}, ${vegan ? 1 : 0}, ${vegetarian ? 1 : 0}, ${glutenFree ? 1 : 0}, '${summary}')`;
    try {
      await DButils.execQuery(query);
      return { success: true, message: "Recipe successfully added to MyRecipes." };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
}


// async function getMyRecipes(username){
//     const recipes = await DButils.execQuery(`select recipe_id from MyRecipes where username='${username}'`);
//     if (recipes.length === 0) {
//         throw new Error("There are no users recipes recipes");
//     }
//     return recipes ;
// }

async function getMyRecipes(username) {
    const query = `SELECT * FROM myrecipes WHERE username='${username}'`;
    try {
      const recipes = await DButils.execQuery(query);
      return { success: true, data: recipes };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }

// Function to add an instruction to the instructions table
async function addInstruction(recipe_id, instruction_num, instruction) {
    const query = `INSERT INTO instructions (recipe_id, instruction_num, instruction) 
                   VALUES (${recipe_id}, ${instruction_num}, '${instruction}')`;
    try {
      await DButils.execQuery(query);
      return { success: true, message: "Instruction successfully added." };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }


// Function to add an ingredient to the ingredients table
async function addIngredient(recipe_id, ingredient, amount) {
    const query = `INSERT INTO ingredients (recipe_id, ingredient, amount) 
                   VALUES (${recipe_id}, '${ingredient}', '${amount}')`;
    try {
      await DButils.execQuery(query);
      return { success: true, message: "Ingredient successfully added." };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }

// Function to get all ingredients for a specific recipe
async function getIngredients(recipe_id) {
    const query = `SELECT * FROM ingredients WHERE recipe_id=${recipe_id}`;
    try {
      const ingredients = await DButils.execQuery(query);
      return { success: true, data: ingredients };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }

// Function to get all instructions for a specific recipe
async function getInstructions(recipe_id) {
    const query = `SELECT * FROM instructions WHERE recipe_id=${recipe_id}`;
    try {
      const instructions = await DButils.execQuery(query);
      return { success: true, data: instructions };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }

exports.markAsFavorite = markAsFavorite;
exports.removeFavorite = removeFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addMyRecipe = addMyRecipe;
exports.getMyRecipes = getMyRecipes;
exports.addInstruction =addInstruction;
exports.addIngredient = addIngredient;
exports.getIngredients = getIngredients;
exports.getInstructions = getInstructions;