const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${username}',${recipe_id})`);
}

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where username='${username}'`);
    return recipes_id;
}

async function addFamilyRecipe(username, title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary, instructions){
    await DButils.execQuery(`insert into FamilyRecipes values ('${username}',${recipe_id},${recipe_name},${title},${image},${readyInMinutes},${aggregateLikes},${vegetarian},${vegan},${glutenFree},${summary},${instructions}`);
}

async function addMyRecipe(username, title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary, instructions){
    await DButils.execQuery(`insert into MyRecipes values ('${username}',${recipe_id},${recipe_name},${title},${image},${readyInMinutes},${aggregateLikes},${vegetarian},${vegan},${glutenFree},${summary},${instructions}`);
}


async function getMyRecipe(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from MyRecipes where username='${username}'`);
    return recipes_id;
}




exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addFamilyRecipe = addFamilyRecipe;
exports.addMyRecipe = addMyRecipe;
exports.getMyRecipe = getMyRecipe;
