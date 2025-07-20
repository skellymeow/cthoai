Use one of our client libraries to get started quickly.


Node.js

Python

HTTP
Set the REPLICATE_API_TOKEN environment variable

export REPLICATE_API_TOKEN=<paste-your-token-here>

Visibility

Copy
Learn more about authentication

Install Replicate’s Node.js client library

npm install replicate

Copy
Learn more about setup
Run google/imagen-4-fast using Replicate’s API. Check out the model's schema for an overview of inputs and outputs.

import { writeFile } from "fs/promises";
import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    prompt: "The photo: Create a cinematic, photorealistic medium shot capturing the dynamic energy of a high-octane action film. The focus is a young woman with wind-swept dark hair streaked with pink highlights and determined features, looking directly and intently into the camera lens, she is slightly off-center. She wears a fitted pink and gold racing jacket over a black tank top with \"Imagen 4 Fast\" in motion-stylized lettering and on the next line \"on Replicate\" emblazoned across the chest and aviator sunglasses pushed up on her head. The lighting is dramatic with motion blur streaks and neon reflections from passing city lights, creating dynamic lens flares and light trails (they do not cover her face). The background shows a blurred urban nightscape with streaking car headlights and illuminated skyscrapers rushing past, rendered with heavy motion blur and shallow depth of field. High contrast lighting, vibrant neon color palette with deep blues and electric yellows, and razor-sharp focus on her intense eyes enhance the fast-paced, electrifying atmosphere. She is illuminated while the background is darker.",
    aspect_ratio: "4:3"
};

const output = await replicate.run("google/imagen-4-fast", { input });

// To access the file URL:
console.log(output.url());
//=> "https://replicate.delivery/.../output.jpg"

// To write the file to disk:
await writeFile("output.jpg", output);
//=> output.jpg written to disk

Authentication
Whenever you make an API request, you need to authenticate using a token. A token is like a password that uniquely identifies your account and grants you access.

The following examples all expect your Replicate access token to be available from the command line. Because tokens are secrets, they should not be in your code. They should instead be stored in environment variables. Replicate clients look for the REPLICATE_API_TOKEN environment variable and use it if available.

To set this up you can use:

export REPLICATE_API_TOKEN=<paste-your-token-here>

Visibility

Copy
Some application frameworks and tools also support a text file named .env which you can edit to include the same token:

REPLICATE_API_TOKEN=<paste-your-token-here>

Visibility

Copy
The Replicate API uses the Authorization HTTP header to authenticate requests. If you’re using a client library this is handled for you.

You can test that your access token is setup correctly by using our account.get endpoint:

What is cURL?
curl https://api.replicate.com/v1/account -H "Authorization: Bearer $REPLICATE_API_TOKEN"
# {"type":"user","username":"aron","name":"Aron Carroll","github_url":"https://github.com/aron"}

Copy
If it is working correctly you will see a JSON object returned containing some information about your account, otherwise ensure that your token is available:

echo "$REPLICATE_API_TOKEN"
# "r8_xyz"

Copy
Setup
NodeJS supports two module formats ESM and CommonJS. Below details the setup for each environment. After setup, the code is identical regardless of module format.

ESM
First you’ll need to ensure you have a NodeJS project:

npm create esm -y

Copy
Then install the replicate JavaScript library using npm:

npm install replicate

Copy
To use the library, first import and create an instance of it:

import Replicate from "replicate";

const replicate = new Replicate();

Copy
This will use the REPLICATE_API_TOKEN API token you’ve setup in your environment for authorization.

CommonJS
First you’ll need to ensure you have a NodeJS project:

npm create -y

Copy
Then install the replicate JavaScript library using npm:

npm install replicate

Copy
To use the library, first import and create an instance of it:

const Replicate = require("replicate");

const replicate = new Replicate();

Copy
This will use the REPLICATE_API_TOKEN API token you’ve setup in your environment for authorization.

Run the model
Use the replicate.run() method to run the model:

const input = {
    prompt: "The photo: Create a cinematic, photorealistic medium shot capturing the dynamic energy of a high-octane action film. The focus is a young woman with wind-swept dark hair streaked with pink highlights and determined features, looking directly and intently into the camera lens, she is slightly off-center. She wears a fitted pink and gold racing jacket over a black tank top with \"Imagen 4 Fast\" in motion-stylized lettering and on the next line \"on Replicate\" emblazoned across the chest and aviator sunglasses pushed up on her head. The lighting is dramatic with motion blur streaks and neon reflections from passing city lights, creating dynamic lens flares and light trails (they do not cover her face). The background shows a blurred urban nightscape with streaking car headlights and illuminated skyscrapers rushing past, rendered with heavy motion blur and shallow depth of field. High contrast lighting, vibrant neon color palette with deep blues and electric yellows, and razor-sharp focus on her intense eyes enhance the fast-paced, electrifying atmosphere. She is illuminated while the background is darker.",
    aspect_ratio: "4:3"
};

const output = await replicate.run("google/imagen-4-fast", { input });

// To access the file URL:
console.log(output.url());
//=> "https://replicate.delivery/.../output.jpg"

// To write the file to disk:
await writeFile("output.jpg", output);
//=> output.jpg written to disk

Copy
You can learn about pricing for this model on the model page.

The run() function returns the output directly, which you can then use or pass as the input to another model. If you want to access the full prediction object (not just the output), use the replicate.predictions.create() method instead. This will include the prediction id, status, logs, etc.

Prediction lifecycle
Running predictions and trainings can often take significant time to complete, beyond what is reasonable for an HTTP request/response.

When you run a model on Replicate, the prediction is created with a “starting” state, then instantly returned. This will then move to "processing" and eventual one of “successful”, "failed" or "canceled".

Starting
Running
Succeeded
Failed
Canceled
You can explore the prediction lifecycle by using the predictions.get() method to retrieve the latest version of the prediction until completed.

Show example
Webhooks
Webhooks provide real-time updates about your prediction. Specify an endpoint when you create a prediction, and Replicate will send HTTP POST requests to that URL when the prediction is created, updated, and finished.

It is possible to provide a URL to the predictions.create() function that will be requested by Replicate when the prediction status changes. This is an alternative to polling.

To receive webhooks you’ll need a web server. The following example uses Hono, a web standards based server, but this pattern applies to most frameworks.

Show example
Then create the prediction passing in the webhook URL and specify which events you want to receive out of "start", "output", ”logs” and "completed".

const input = {
    prompt: "The photo: Create a cinematic, photorealistic medium shot capturing the dynamic energy of a high-octane action film. The focus is a young woman with wind-swept dark hair streaked with pink highlights and determined features, looking directly and intently into the camera lens, she is slightly off-center. She wears a fitted pink and gold racing jacket over a black tank top with \"Imagen 4 Fast\" in motion-stylized lettering and on the next line \"on Replicate\" emblazoned across the chest and aviator sunglasses pushed up on her head. The lighting is dramatic with motion blur streaks and neon reflections from passing city lights, creating dynamic lens flares and light trails (they do not cover her face). The background shows a blurred urban nightscape with streaking car headlights and illuminated skyscrapers rushing past, rendered with heavy motion blur and shallow depth of field. High contrast lighting, vibrant neon color palette with deep blues and electric yellows, and razor-sharp focus on her intense eyes enhance the fast-paced, electrifying atmosphere. She is illuminated while the background is darker.",
    aspect_ratio: "4:3"
};

const callbackURL = `https://my.app/webhooks/replicate`;
await replicate.predictions.create({
  model: "google/imagen-4-fast",
  input: input,
  webhook: callbackURL,
  webhook_events_filter: ["completed"],
});

// The server will now handle the event and log:
// => {"id": "xyz", "status": "successful", ... }

Copy
ℹ️ The replicate.run() method is not used here. Because we're using webhooks, and we don’t need to poll for updates.

Co-ordinating between a prediction request and a webhook response will require some glue. A simple implementation for a single JavaScript server could use an event emitter to manage this.

Show example
From a security perspective it is also possible to verify that the webhook came from Replicate. Check out our documentation on verifying webhooks for more information.

Access a prediction
You may wish to access the prediction object. In these cases it’s easier to use the replicate.predictions.create() or replicate.deployments.predictions.create() functions which will return the prediction object.

Though note that these functions will only return the created prediction, and it will not wait for that prediction to be completed before returning. Use replicate.predictions.get() to fetch the latest prediction.

const input = {
    prompt: "The photo: Create a cinematic, photorealistic medium shot capturing the dynamic energy of a high-octane action film. The focus is a young woman with wind-swept dark hair streaked with pink highlights and determined features, looking directly and intently into the camera lens, she is slightly off-center. She wears a fitted pink and gold racing jacket over a black tank top with \"Imagen 4 Fast\" in motion-stylized lettering and on the next line \"on Replicate\" emblazoned across the chest and aviator sunglasses pushed up on her head. The lighting is dramatic with motion blur streaks and neon reflections from passing city lights, creating dynamic lens flares and light trails (they do not cover her face). The background shows a blurred urban nightscape with streaking car headlights and illuminated skyscrapers rushing past, rendered with heavy motion blur and shallow depth of field. High contrast lighting, vibrant neon color palette with deep blues and electric yellows, and razor-sharp focus on her intense eyes enhance the fast-paced, electrifying atmosphere. She is illuminated while the background is darker.",
    aspect_ratio: "4:3"
};
const prediction = replicate.predictions.create({
  model: "google/imagen-4-fast",
  input
});
// { "id": "xyz123", "status": "starting", ... }

Copy
Cancel a prediction
You may need to cancel a prediction. Perhaps the user has navigated away from the browser or canceled your application. To prevent unnecessary work and reduce runtime costs you can use the replicate.predictions.cancel function and pass it a prediction id.

await replicate.predictions.cancel(prediction.id);

Input schema
Table
JSON
prompt
string
Text prompt for image generation

aspect_ratio
string
Aspect ratio of the generated image

Default
"1:1"
output_format
string
Format of the output image

Default
"jpg"
safety_filter_level
string
block_low_and_above is strictest, block_medium_and_above blocks some prompts, block_only_high is most permissive but some prompts will still be blocked

Default
"block_only_high"
Output schema
Table
JSON
Type
uri

