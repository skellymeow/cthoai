fal-ai/playai/tts/v3

About
V3

1. Calling the API
#
Install the client
#
The client provides a convenient way to interact with the model API.

npmyarnpnpmbun

pnpm add @fal-ai/client
Migrate to @fal-ai/client
The @fal-ai/serverless-client package has been deprecated in favor of @fal-ai/client. Please check the migration guide for more information.

Setup your API Key
#
Set FAL_KEY as an environment variable in your runtime.


export FAL_KEY="YOUR_API_KEY"
Submit a request
#
The client API handles the API submit protocol. It will handle the request status updates and return the result when the request is completed.


import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/playai/tts/v3", {
  input: {
    input: "The quick brown fox jumped over the lazy dog.",
    voice: "Jennifer (English (US)/American)"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
2. Authentication
#
The API uses an API Key for authentication. It is recommended you set the FAL_KEY environment variable in your runtime when possible.

API Key
#
In case your app is running in an environment where you cannot set environment variables, you can set the API Key manually as a client configuration.

import { fal } from "@fal-ai/client";

fal.config({
  credentials: "YOUR_FAL_KEY"
});
Protect your API Key
When running code on the client-side (e.g. in a browser, mobile app or GUI applications), make sure to not expose your FAL_KEY. Instead, use a server-side proxy to make requests to the API. For more information, check out our server-side integration guide.

3. Queue
#
Long-running requests
For long-running requests, such as training jobs or models with slower inference times, it is recommended to check the Queue status and rely on Webhooks instead of blocking while waiting for the result.

Submit a request
#
The client API provides a convenient way to submit requests to the model.


import { fal } from "@fal-ai/client";

const { request_id } = await fal.queue.submit("fal-ai/playai/tts/v3", {
  input: {
    input: "The quick brown fox jumped over the lazy dog.",
    voice: "Jennifer (English (US)/American)"
  },
  webhookUrl: "https://optional.webhook.url/for/results",
});
Fetch request status
#
You can fetch the status of a request to check if it is completed or still in progress.


import { fal } from "@fal-ai/client";

const status = await fal.queue.status("fal-ai/playai/tts/v3", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b",
  logs: true,
});
Get the result
#
Once the request is completed, you can fetch the result. See the Output Schema for the expected result format.


import { fal } from "@fal-ai/client";

const result = await fal.queue.result("fal-ai/playai/tts/v3", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b"
});
console.log(result.data);
console.log(result.requestId);
4. Files
#
Some attributes in the API accept file URLs as input. Whenever that's the case you can pass your own URL or a Base64 data URI.

Data URI (base64)
#
You can pass a Base64 data URI as a file input. The API will handle the file decoding for you. Keep in mind that for large files, this alternative although convenient can impact the request performance.

Hosted files (URL)
#
You can also pass your own URLs as long as they are publicly accessible. Be aware that some hosts might block cross-site requests, rate-limit, or consider the request as a bot.

Uploading files
#
We provide a convenient file storage that allows you to upload files and use them in your requests. You can upload files using the client API and use the returned URL in your requests.


import { fal } from "@fal-ai/client";

const file = new File(["Hello, World!"], "hello.txt", { type: "text/plain" });
const url = await fal.storage.upload(file);
Auto uploads
The client will auto-upload the file for you if you pass a binary object (e.g. File, Data).

Read more about file handling in our file upload guide.

5. Schema
#
Input
#
input string
The text to be converted to speech.

voice string
The unique ID of a PlayHT or Cloned Voice, or a name from the available presets.

response_format ResponseFormatEnum
The format of the response. Default value: "url"

Possible enum values: url, bytes

seed integer
An integer number greater than or equal to 0. If equal to null or not provided, a random seed will be used. Useful to control the reproducibility of the generated audio. Assuming all other properties didn't change, a fixed seed should always generate the exact same audio file.


{
  "input": "The quick brown fox jumped over the lazy dog.",
  "voice": "Jennifer (English (US)/American)",
  "response_format": "url",
  "seed": null
}
Output
#
audio AudioFile
The generated audio file.


{
  "audio": {
    "file_size": 57069,
    "duration": 2.3486666666666665,
    "file_name": "166db034-7421-4767-adad-ab7c36a99b75.mp3",
    "content_type": "audio/mpeg",
    "url": "https://fal-api-audio-uploads.s3.amazonaws.com/166db034-7421-4767-adad-ab7c36a99b75.mp3"
  }
}
Other types
#
WordTime
#
text string
The word to inpaint.

timestamp list<void>
The start and end timestamp of the word.

File
#
url string
The URL where the file can be downloaded from.

content_type string
The mime type of the file.

file_name string
The name of the file. It will be auto-generated if not provided.

file_size integer
The size of the file in bytes.

file_data string
File data

AudioFile
#
url string
The URL where the file can be downloaded from.

content_type string
The mime type of the file.

file_name string
The name of the file. It will be auto-generated if not provided.

file_size integer
The size of the file in bytes.

file_data string
File data

duration float
The duration of the audio file in seconds.

Related Models

{"openapi":"3.0.4","info":{"title":"Queue OpenAPI for fal-ai/playai/tts/v3","version":"1.0.0","description":"The OpenAPI schema for the fal-ai/playai/tts/v3 queue.","x-fal-metadata":{"endpointId":"fal-ai/playai/tts/v3","category":"text-to-speech","thumbnailUrl":"https://storage.googleapis.com/falserverless/gallery/playht-tts-v3.jpeg","playgroundUrl":"https://fal.ai/models/fal-ai/playai/tts/v3","documentationUrl":"https://fal.ai/models/fal-ai/playai/tts/v3/api"}},"components":{"securitySchemes":{"apiKeyAuth":{"type":"apiKey","in":"header","name":"Authorization","description":"Fal Key"}},"schemas":{"QueueStatus":{"type":"object","properties":{"status":{"type":"string","enum":["IN_QUEUE","IN_PROGRESS","COMPLETED"]},"request_id":{"type":"string","description":"The request id."},"response_url":{"type":"string","description":"The response url."},"status_url":{"type":"string","description":"The status url."},"cancel_url":{"type":"string","description":"The cancel url."},"logs":{"type":"object","description":"The logs.","additionalProperties":true},"metrics":{"type":"object","description":"The metrics.","additionalProperties":true},"queue_position":{"type":"integer","description":"The queue position."}},"required":["status","request_id"]},"PlayaiTtsV3Input":{"title":"V3TTSInput","type":"object","properties":{"response_format":{"enum":["url","bytes"],"title":"Response Format","type":"string","description":"The format of the response.","default":"url"},"input":{"examples":["The quick brown fox jumped over the lazy dog."],"title":"Input","type":"string","description":"The text to be converted to speech.","minLength":1},"voice":{"examples":["Jennifer (English (US)/American)","Dexter (English (US)/American)","Ava (English (AU)/Australian)","Tilly (English (AU)/Australian)","Charlotte (Advertising) (English (CA)/Canadian)","Charlotte (Meditation) (English (CA)/Canadian)","Cecil (English (GB)/British)","Sterling (English (GB)/British)","Cillian (English (IE)/Irish)","Madison (English (IE)/Irish)","Ada (English (ZA)/South african)","Furio (English (IT)/Italian)","Alessandro (English (IT)/Italian)","Carmen (English (MX)/Mexican)","Sumita (English (IN)/Indian)","Navya (English (IN)/Indian)","Baptiste (English (FR)/French)","Lumi (English (FI)/Finnish)","Ronel Conversational (Afrikaans/South african)","Ronel Narrative (Afrikaans/South african)","Abdo Conversational (Arabic/Arabic)","Abdo Narrative (Arabic/Arabic)","Mousmi Conversational (Bengali/Bengali)","Mousmi Narrative (Bengali/Bengali)","Caroline Conversational (Portuguese (BR)/Brazilian)","Caroline Narrative (Portuguese (BR)/Brazilian)","Ange Conversational (French/French)","Ange Narrative (French/French)","Anke Conversational (German/German)","Anke Narrative (German/German)","Bora Conversational (Greek/Greek)","Bora Narrative (Greek/Greek)","Anuj Conversational (Hindi/Indian)","Anuj Narrative (Hindi/Indian)","Alessandro Conversational (Italian/Italian)","Alessandro Narrative (Italian/Italian)","Kiriko Conversational (Japanese/Japanese)","Kiriko Narrative (Japanese/Japanese)","Dohee Conversational (Korean/Korean)","Dohee Narrative (Korean/Korean)","Ignatius Conversational (Malay/Malay)","Ignatius Narrative (Malay/Malay)","Adam Conversational (Polish/Polish)","Adam Narrative (Polish/Polish)","Andrei Conversational (Russian/Russian)","Andrei Narrative (Russian/Russian)","Aleksa Conversational (Serbian/Serbian)","Aleksa Narrative (Serbian/Serbian)","Carmen Conversational (Spanish/Spanish)","Patricia Conversational (Spanish/Spanish)","Aiken Conversational (Tagalog/Filipino)","Aiken Narrative (Tagalog/Filipino)","Katbundit Conversational (Thai/Thai)","Katbundit Narrative (Thai/Thai)","Ali Conversational (Turkish/Turkish)","Ali Narrative (Turkish/Turkish)","Sahil Conversational (Urdu/Pakistani)","Sahil Narrative (Urdu/Pakistani)","Mary Conversational (Hebrew/Israeli)","Mary Narrative (Hebrew/Israeli)"],"title":"Voice","type":"string","description":"The unique ID of a PlayHT or Cloned Voice, or a name from the available presets."},"seed":{"examples":[null],"title":"Seed","type":"integer","description":"An integer number greater than or equal to 0. If equal to null or not provided, a random seed will be used. Useful to control the reproducibility of the generated audio. Assuming all other properties didn't change, a fixed seed should always generate the exact same audio file.","minimum":0}},"x-fal-order-properties":["input","voice","response_format","seed"],"required":["voice","input"]},"PlayaiTtsV3Output":{"title":"V3TTSOutput","type":"object","properties":{"audio":{"examples":[{"file_size":57069,"duration":2.3486666666666665,"file_name":"166db034-7421-4767-adad-ab7c36a99b75.mp3","content_type":"audio/mpeg","url":"https://fal-api-audio-uploads.s3.amazonaws.com/166db034-7421-4767-adad-ab7c36a99b75.mp3"}],"title":"Audio","description":"The generated audio file.","allOf":[{"$ref":"#/components/schemas/AudioFile"}]}},"x-fal-order-properties":["audio"],"required":["audio"]},"AudioFile":{"title":"AudioFile","type":"object","properties":{"file_size":{"examples":[4404019],"title":"File Size","type":"integer","description":"The size of the file in bytes."},"duration":{"title":"Duration","type":"number","description":"The duration of the audio file in seconds."},"file_name":{"examples":["z9RV14K95DvU.png"],"title":"File Name","type":"string","description":"The name of the file. It will be auto-generated if not provided."},"content_type":{"examples":["image/png"],"title":"Content Type","type":"string","description":"The mime type of the file."},"url":{"title":"Url","type":"string","description":"The URL where the file can be downloaded from."},"file_data":{"format":"binary","title":"File Data","type":"string","description":"File data"}},"x-fal-order-properties":["url","content_type","file_name","file_size","file_data","duration"],"required":["url","duration"]}}},"paths":{"/fal-ai/playai/tts/v3/requests/{request_id}/status":{"get":{"parameters":[{"name":"request_id","in":"path","required":true,"schema":{"type":"string","description":"Request ID"}},{"name":"logs","in":"query","required":false,"schema":{"type":"number","description":"Whether to include logs (`1`) in the response or not (`0`)."}}],"responses":{"200":{"description":"The request status.","content":{"application/json":{"schema":{"$ref":"#/components/schemas/QueueStatus"}}}}}}},"/fal-ai/playai/tts/v3/requests/{request_id}/cancel":{"put":{"parameters":[{"name":"request_id","in":"path","required":true,"schema":{"type":"string","description":"Request ID"}}],"responses":{"200":{"description":"The request was cancelled.","content":{"application/json":{"schema":{"type":"object","properties":{"success":{"type":"boolean","description":"Whether the request was cancelled successfully."}}}}}}}}},"/fal-ai/playai/tts/v3":{"post":{"requestBody":{"required":true,"content":{"application/json":{"schema":{"$ref":"#/components/schemas/PlayaiTtsV3Input"}}}},"responses":{"200":{"description":"The request status.","content":{"application/json":{"schema":{"$ref":"#/components/schemas/QueueStatus"}}}}}}},"/fal-ai/playai/tts/v3/requests/{request_id}":{"get":{"parameters":[{"name":"request_id","in":"path","required":true,"schema":{"type":"string","description":"Request ID"}}],"responses":{"200":{"description":"Result of the request.","content":{"application/json":{"schema":{"$ref":"#/components/schemas/PlayaiTtsV3Output"}}}}}}}},"servers":[{"url":"https://queue.fal.run"}],"security":[{"apiKeyAuth":[]}]}