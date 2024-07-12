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

async function addMyRecipe(username, recipe_id, title, image, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, summary, instructions) {
    const query = `INSERT INTO myrecipes (username, recipe_id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, summary, instructions) 
                   VALUES ('${username}', ${recipe_id}, '${title}', ${readyInMinutes}, '${image}', ${aggregateLikes}, ${vegan ? 1 : 0}, ${vegetarian ? 1 : 0}, ${glutenFree ? 1 : 0}, '${summary}', '${instructions}')`;
    try {
        await DButils.execQuery(query);
        return { success: true, message: "Recipe successfully added to MyRecipes." };
    } catch (error) {
        console.error("SQL Error: ", error.message);
        return { success: false, message: error.message };
    }
}



async function getMyRecipes(username){
    const recipes = await DButils.execQuery(`select recipe_id from MyRecipes where username='${username}'`);
    if (recipes.length === 0) {
        throw new Error("There are no users recipes recipes");
    }
    return recipes ;
}




exports.markAsFavorite = markAsFavorite;
exports.removeFavorite = removeFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addMyRecipe = addMyRecipe;
exports.getMyRecipes = getMyRecipes;
