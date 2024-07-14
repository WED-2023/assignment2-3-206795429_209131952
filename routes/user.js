var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users").then((users) => {
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(username,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

router.delete('/favorites', async (req, res, next) => {
  try {
      const username = req.session.username;
      const recipe_id = req.body.recipeId;
      await user_utils.removeFavorite(username, recipe_id);
      res.status(200).send("The Recipe successfully removed from favorites");
  } catch (error) {
    if (error.message === "Recipe not found in favorites") {
      res.status(404).send("Recipe not found");
    } else {
        next(error); // Handle other errors normally
    }
  }
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    if (error.message === "There are no favorite recipes") {
      res.status(404).send("There are no favorite recipes");
    } else {
        next(error); // Handle other errors normally
    } 
  }
});


/**
 * This path gets body with frecipe and save this recipe in the list of the logged-in user
 */
// router.post('/my_recipes', async (req,res,next) => {
//   try{
//     const username = req.session.username;
//     const recipe_id = req.body.recipeId;
//     const title = req.body.title;
//     const image = req.body.image;
//     const readyInMinutes = req.body.readyInMinutes;
//     const aggregateLikes = req.body.aggregateLikes;
//     const vegetarian = req.body.vegetarian;
//     const vegan = req.body.vegan;
//     const glutenFree = req.body.glutenFree;
//     const summary = req.body.summary;
//     const instructions = req.body.instructions;


//     await user_utils.addMyRecipe(username,recipe_id, title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary, instructions);
//     res.status(200).send("The Recipe successfully saved in MyRecipes");
//     } catch(error){
//     next(error);
//   }
// });


router.post('/my_recipes', async (req, res, next) => {
  try {
    const username = req.session.username;
    const { title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary, ingredients, instructions } = req.body;

    // Assuming recipeId is generated automatically in the database upon insertion
    const addRecipeResult = await user_utils.addMyRecipe(username, title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary);

    // Assuming the inserted recipeId can be retrieved from the addRecipeResult if needed
    const recipeId = addRecipeResult.insertId; // Adjust based on how your DButils.execQuery returns the insertId

    for (const [index, instruction] of instructions.entries()) {
      await user_utils.addInstruction(recipeId, index + 1, instruction);
    }

    for (const ingredient of ingredients) {
      await user_utils.addIngredient(recipeId, ingredient.name, ingredient.amount);
    }

    res.status(200).send("The Recipe successfully saved in MyRecipes");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the user's recipes that were created by the logged-in user
 */
// router.get('/my_recipes', async (req,res,next) => {
//   try{
//     const username = req.session.username;
//     let my_recipes = {};
//     const recipes = await user_utils.getMyRecipes(username);
//     let recipes_id_array = [];
//     recipes.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
//     const results = await recipe_utils.getRecipesPreview(recipes_id_array);
//     res.status(200).send(results);
//   } catch(error){
//     if (error.message === "There are no users recipes recipes") {
//       res.status(404).send("There are no users recipes recipes");
//     } else {
//         next(error); // Handle other errors normally
//     } 
// }});


router.get('/my_recipes', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipes = await user_utils.getMyRecipes(username);
    const recipeIds = recipes.map(recipe => recipe.recipe_id);

    const recipePreviews = await recipe_utils.getRecipesPreview(recipeIds);

    for (const recipe of recipePreviews) {
      recipe.ingredients = await user_utils.getIngredients(recipe.recipe_id);
      recipe.instructions = await user_utils.getInstructions(recipe.recipe_id);
    }

    res.status(200).send(recipePreviews);
  } catch (error) {
    next(error);
  }
});








module.exports = router;
