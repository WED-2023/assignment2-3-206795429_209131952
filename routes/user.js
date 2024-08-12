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

router.get('/favorites/check', async function (req, res, next) {
  try {
    const { username, recipeId } = req.query;

    if (!username || !recipeId) {
      return res.status(400).json({ error: 'Missing username or recipeId' });
    }

    // Correct SQL query with placeholders
    const query = `SELECT * FROM favoriterecipes WHERE username = '${username}' AND recipe_id = ${recipeId}`;

    // Execute the query with the parameters properly passed
    DButils.execQuery(query, [username, recipeId])
      .then((results) => {
        if (results.length > 0) {
          return res.status(200).json({ isFavorite: true });
        } else {
          return res.status(200).json({ isFavorite: false });
        }
      })
      .catch((error) => {
        return next(error);  // Pass the error to the error handler
      });
  } catch (error) {
    return next(error);  // Pass the error to the error handler
  }
});

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
      res.status(201).send("Recipe added to favorites");
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
    const { title, image, readyInMinutes, servings, vegetarian, vegan, glutenFree, summary, ingredients, instructions } = req.body;

    // Assuming recipeId is generated automatically in the database upon insertion
    const addRecipeResult = await user_utils.addMyRecipe(username, title, image, readyInMinutes, servings, vegetarian, vegan, glutenFree, summary);

    // Assuming the inserted recipeId can be retrieved from the addRecipeResult if needed
    const recipeId = addRecipeResult.insertId; // Adjust based on how your DButils.execQuery returns the insertId

    for (const [index, instruction] of instructions.entries()) {
      await user_utils.addInstruction(username, title, index + 1, instruction);
    }

    for (const ingredient of ingredients) {
      await user_utils.addIngredient(username, title, ingredient.name, ingredient.amount);
    }

    res.status(201).send("The Recipe successfully saved in MyRecipes");
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
   // const recipetitles = recipes.map(recipe => recipe.title);
    //const recipePreviews = await recipe_utils.getRecipesPreview(recipetitles);

    for (const recipe of recipes) {
      recipe.ingredients = (await user_utils.getIngredients(recipe.title, username)).data;
      recipe.instructions = (await user_utils.getInstructions(recipe.title, username)).data;
    }

    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});


router.get('/my_recipes/:title',isAuthenticated, async (req, res, next) => {
  try {
    const username = req.session.username;
    const result = await user_utils.getMyOneRecipes(username, req.params.title);

    if (!result.success) {
      throw new Error(result.message);
    }

    const recipe = result.data;
   // const recipetitles = recipes.map(recipe => recipe.title);

    //const recipePreviews = await recipe_utils.getRecipesPreview(recipetitles);
    const ingredientsResult = await user_utils.getIngredients(req.params.title, username);
    const instructionsResult = await user_utils.getInstructions(req.params.title, username);

    // Extract ingredients and instructions into lists
    recipe.ingredients = ingredientsResult.data.map(item => ({
      ingredient: item.ingredient,
      amount: item.amount
    }));

    recipe.instructions = instructionsResult.data.map(item => ({instruction: item.instruction
    }));

    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

// GET endpoint to fetch the last viewed recipes
router.get('/last_viewed_recipes', isAuthenticated, async (req, res, next) => {
  try {
    const username = req.session.username; // Assuming req.user contains the authenticated user information
    const recipeIds = await user_utils.getLastViewedRecipes(username);

    // Fetch details for each recipe ID
    const recipes = [];
    for (const recipeId of recipeIds) {
      const recipeDetails = await recipe_utils.getRecipeDetails(recipeId.recipe_id);
      recipes.push(recipeDetails);
    }

    res.status(200).json({ recipes });
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
