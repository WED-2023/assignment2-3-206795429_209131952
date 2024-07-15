const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${username}',${recipe_id})`);
}

async function removeFavorite(username, recipe_id) {
    const result = await DButils.execQuery(`DELETE FROM favoriterecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
    if (result.affectedRows === 0) {
        throw new Error("Recipe not found in favorites");
    }
}

async function isRecipeFavorite(username, recipeId) {
  // Query the database to check if the recipeId exists in the favorites of the user
  const query = `SELECT * FROM favoriterecipes WHERE username = '${username}' AND recipe_id = ${recipeId}`;
  try {
    const result = await DButils.execQuery(query);
    if (result.length > 0){
      return true // If there are results, the recipe is marked as favorite
    }
    else{
      return false
    }
  } catch (error) {
    throw new Error(`Error checking if recipe ${recipeId} is favorite for user ${username}: ${error.message}`);
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

  async function getMyOneRecipes(username, title) {
    const query = `SELECT * FROM myrecipes WHERE username='${username}' and title='${title}'`;
    try {
      const recipe = await DButils.execQuery(query);
      return { success: true, data: recipe };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }

// Function to add an instruction to the instructions table
async function addInstruction(username, title, instruction_num, instruction) {
    const query = `INSERT INTO instructions (username, title, instruction_num, instruction) 
                   VALUES ('${username}', '${title}', '${instruction_num}', '${instruction}')`;
    try {
      await DButils.execQuery(query);
      return { success: true, message: "Instruction successfully added." };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }


// Function to add an ingredient to the ingredients table
async function addIngredient(username, title, ingredient, amount) {
    const query = `INSERT INTO ingredients (username, title, ingredient, amount) 
                   VALUES ('${username}', '${title}', '${ingredient}', '${amount}')`;
    try {
      await DButils.execQuery(query);
      return { success: true, message: "Ingredient successfully added." };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }

// Function to get all ingredients for a specific recipe
async function getIngredients(title,username) {
    const query = `SELECT * FROM ingredients WHERE title='${title}' AND username='${username}'`;
    try {
      const ingredients = await DButils.execQuery(query);
      return { success: true, data: ingredients };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }

// Function to get all instructions for a specific recipe
async function getInstructions(title, username) {
    const query = `SELECT * FROM instructions WHERE title='${title}' AND username='${username}'`;
    try {
      const instructions = await DButils.execQuery(query);
      return { success: true, data: instructions };
    } catch (error) {
      console.error("SQL Error: ", error.message);
      return { success: false, message: error.message };
    }
  }

// Function to mark a recipe as viewed
async function markAsViewed(username, recipe_id) {
  const time = new Date(); // Use current time as the time of viewing
  const query = `
    INSERT INTO userslastviews (username, recipe_id, time)
    VALUES ('${username}', ${recipe_id}, '${time.toISOString().slice(0, 19).replace('T', ' ')}')
    ON DUPLICATE KEY UPDATE time = VALUES(time)
  `;
  try {
    await DButils.execQuery(query);
  } catch (error) {
    throw new Error(`Error marking recipe as viewed for user ${username}: ${error.message}`);
  }
}

// Function to get the last viewed recipes
async function getLastViewedRecipes(username) {
  const query = `
    SELECT recipe_id
    FROM userslastviews ulv
    WHERE ulv.username = '${username}'
    ORDER BY ulv.time DESC
    LIMIT 3
  `;
  try {
    const rows = await DButils.execQuery(query);
    return rows;
  } catch (error) {
    throw new Error(`Error fetching last viewed recipes for user ${username}: ${error.message}`);
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
exports.markAsViewed = markAsViewed;
exports.getLastViewedRecipes = getLastViewedRecipes;
exports.isRecipeFavorite = isRecipeFavorite;
exports.getMyOneRecipes = getMyOneRecipes;