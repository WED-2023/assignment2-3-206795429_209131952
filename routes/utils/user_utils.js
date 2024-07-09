const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${username}',${recipe_id})`);
}

async function removeFavorite(username, recipe_id) {
    await DButils.execQuery(`DELETE FROM FavoriteRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
}

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where username='${username}'`);
    return recipes_id;
}

async function addMyRecipe(username, recipe_id, title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary, instructions) {
    const query = `INSERT INTO myrecipes (username, recipe_id, title, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree, summary, instructions) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [username, recipe_id, title, readyInMinutes, image, aggregateLikes, vegetarian ? 1 : 0, vegan ? 1 : 0, glutenFree ? 1 : 0, summary, instructions];

    try {
        await DButils.execQuery(query, values);
        return { success: true, message: "Recipe successfully added to MyRecipes." };
    } catch (error) {
        return { success: false, message: error.message };
    }
}


async function getMyRecipe(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from MyRecipes where username='${username}'`);
    return recipes_id;
}




exports.markAsFavorite = markAsFavorite;
exports.removeFavorite = removeFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addMyRecipe = addMyRecipe;
exports.getMyRecipe = getMyRecipe;
