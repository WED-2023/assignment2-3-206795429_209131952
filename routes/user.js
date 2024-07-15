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

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.username) {
    return next();
  } else {
    res.status(401).send('Unauthorized');
  }
}



/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
// router.post('/favorites', async (req,res,next) => {
//   try{
//     const username = req.session.username;
//     const recipe_id = req.body.recipeId;
//     await user_utils.markAsFavorite(username,recipe_id);
//     res.status(200).send("The Recipe successfully saved as favorite");
//     } catch(error){
//     next(error);
//   }
// })

// router.delete('/favorites', async (req, res, next) => {
//   try {
//       const username = req.session.username;
//       const recipe_id = req.body.recipeId;
//       await user_utils.removeFavorite(username, recipe_id);
//       res.status(200).send("The Recipe successfully removed from favorites");
//   } catch (error) {
//     if (error.message === "Recipe not found in favorites") {
//       res.status(404).send("Recipe not found");
//     } else {
//         next(error); // Handle other errors normally
//     }
//   }
// });

// POST endpoint to add or remove favorite recipe
router.post('/favorites', async (req, res, next) => {
  try {
    const { recipeId } = req.body;
    const username = req.session.username;

    const isFavorite = await user_utils.isRecipeFavorite(username, recipeId);

    if (isFavorite) {
      await user_utils.removeFavorite(username, recipeId);
      res.status(200).send("Recipe removed from favorites");
    } else {
      await user_utils.markAsFavorite(username, recipeId);
      res.status(200).send("Recipe added to favorites");
    }
  } catch (error) {
    next(error);
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


router.post('/my_recipes',isAuthenticated, async (req, res, next) => {
  try {
    const username = req.session.username;
    const { title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary, ingredients, instructions } = req.body;

    // Assuming recipeId is generated automatically in the database upon insertion
    const addRecipeResult = await user_utils.addMyRecipe(username, title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary);

    // Assuming the inserted recipeId can be retrieved from the addRecipeResult if needed
    const recipeId = addRecipeResult.insertId; // Adjust based on how your DButils.execQuery returns the insertId

    for (const [index, instruction] of instructions.entries()) {
      await user_utils.addInstruction(username, title, index + 1, instruction);
    }

    for (const ingredient of ingredients) {
      await user_utils.addIngredient(username, title, ingredient.name, ingredient.amount);
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


router.get('/my_recipes',isAuthenticated, async (req, res, next) => {
  try {
    const username = req.session.username;
    const result = await user_utils.getMyRecipes(username);

    if (!result.success) {
      throw new Error(result.message);
    }

    const recipes = result.data;
    //const recipetitles = recipes.map(recipe => recipe.title);

    //const recipePreviews = await recipe_utils.getRecipesPreview(recipetitles);

    for (const recipe of recipes) {
      recipe.ingredients = await user_utils.getIngredients(recipe.title);
      recipe.instructions = await user_utils.getInstructions(recipe.title);
    }

    res.status(200).send(recipePreviews);
  } catch (error) {
    next(error);
  }
});

// GET endpoint to fetch the last viewed recipes
router.get('/last_viewed_recipes', isAuthenticated, async (req, res, next) => {
  try {
    const username = req.session.username; // Assuming req.user contains the authenticated user information
    const recipes = await user_utils.getLastViewedRecipes(username);
    res.json({ recipes });
  } catch (error) {
    console.error('Error fetching last viewed recipes:', error);
    next(error);
  }
});


// POST endpoint to add a new last viewed recipe
router.post('/last_viewed_recipes', isAuthenticated, async (req, res, next) => {
  try {
    const username = req.session.username; // Assuming req.user contains the authenticated user information
    const { recipe_id } = req.body;
    await user_utils.markAsViewed(username, recipe_id);
    res.status(201).json({ message: 'Last viewed recipe added/updated successfully' });
  } catch (error) {
    console.error('Error adding/updating last viewed recipe:', error);
    next(error);
  }
});










module.exports = router;
