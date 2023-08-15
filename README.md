# Retrieval-Augmented Generation (RAG) chatbot
Instead of using only a fine-tuned language model to generate the responses, a pre-trained language model combined with a document retriever can be used. This model, called a Retrieval-Augmented Generation model (RAG), first retrieves documents that are relevant to the input text from a provided dataset using a similarity search on the embeddings of the texts. Then it feeds these documents to the language model to generate a response which is relevant and properly worded. 

Using a RAG model would help save time and resources on model training as it does not require fine-tuning. It can be used to generate responses for the tech support chatbot by inserting a dataset containing the knowledge base of the service desk for the document retriever. There would be no need to produce a dataset of queries and responses for training. Furthermore, as certain information in the knowledge base changes, the model can be updated easily by inserting the updated knowledge base into the retriever without the need for any fine-tuning like a traditional language model.

## LangChain
[LangChain](https://python.langchain.com) was used to implement a retrieval question answer engine. LangChain makes use of components and “chains” to build language models. It contains the retrieval question and answer chain which can be used to build a RAG model for the tech support chatbot. 

### Pipeline
1. Load document (txt. or .pdf) and split the text into chunks.
2. Embed text and create [ChromaDB](https://www.trychroma.com) vector store.
- Embedding model: [intfloat/e5-large-v2](https://huggingface.co/intfloat/e5-large-v2) (Model with the highest performance on HuggingFace)
- ChromaDB: Similarity search of embedding vectors is based on cosine similarity
3. Create a question answer retrieval chain.
- Large language model: [OpenAI gpt-3.5-turbo](https://platform.openai.com/) (Paid API) OR [tiiuae/falcon-7b-instruct](https://huggingface.co/tiiuae/falcon-7b-instruct) (Open source model)
- Retriever model from Chroma vector store
4. Using a custom prompt, generate output based on query and document(s) retrieved from vector store.
- Prompt: "You are a chatbot having a conversation with a human.
Given the following context, answer the question. If the context does not provide sufficient context to answer the question, say "Sorry, I do not have enough knowledge to answer the question.".

Context:
{context}

{chat_history}Human: {human_input}
AI: "

### Testing RAG model
RAG chatbot was tested with the context of tech support for Lenovo ThinkPad laptops and Epson L1210 Series printers.\
User guides for both products were used as the knowledge base for document retrieval. The text of the user guides were first extracted with PyPDF2. Then, the text was split into chunks using a recursive splitter with overlap to ensure that a high probability of chunks being coherent and relevant.

**Sample outputs:**\
**A.(with Lenovo ThinkPad user guide)**\
**User:** How to disable fast startup on my thinkpad?
**Bot:** To disable Fast Startup on your ThinkPad, follow these steps:

1. Go to Control Panel and view by Large icons or Small icons.
2. Click Power Options, and then click Choose what the power buttons do on the left pane.
3. Click Change settings that are currently unavailable at the top.
4. If prompted by User Account Control (UAC), click Yes.
5. Clear the Turn on fast startup check box, and then click Save changes.

**B.(with memory)**\
**User:** Hi\
**Bot:** Hello! How can I assist you today?\
**User:** How do I disable fast startup on my Lenovo thinkpad?\
**Bot:** To disable Fast Startup on your Lenovo ThinkPad, follow these steps:
1. Go to Control Panel and view by Large icons or Small icons.
2. Click Power Options, and then click Choose what the power buttons do on the left pane.
3. Click Change settings that are currently unavailable at the top.
4. If prompted by User Account Control (UAC), click Yes.
5. Clear the Turn on fast startup check box, and then click Save changes.
I hope this helps! Let me know if you have any other questions.

**C.(Multi-retriever with Epson printer user guide)**\
**User:** How do I update my printer's firmware?\
**Bot:** To update your printer's firmware, you need to make sure that your printer and computer are connected and that your computer is connected to the internet. Then, start EPSON Software Updater and update the applications or firmware. It's important not to turn off the computer or printer until the update is complete to avoid any malfunctions. If you cannot find the application you want to update in the list, you should check for the latest versions of the applications on your local Epson website.\

### Inclusion of zero-shot classification
An additional step in the pipeline to classify the user's query using zero-shot classification was added to determine which tool to use to generate the output.\
Zero-shot classification model used: [facebook/bart-large-mnli](https://huggingface.co/facebook/bart-large-mnli)\
Tools included: Lenovo ThinkPad laptop RAG model, Epson printer RAG model, Chat LLM, Search ([using Serper Google Search API](https://serper.dev/))

**Sample output:**\
**User:** Good morning\
**tool:** Chat\
**Bot:** Good morning! How can I assist you today?\
**User:** How do I factory reset my ThinkPad?\
**tool:** Lenovo ThinkPad laptop\
**Bot:** To factory reset your ThinkPad, you can follow these steps:
1. Restart the computer.
2. When the logo screen is displayed, immediately press F1 to enter the UEFI BIOS menu.
3. Select Security ➙ Password ➙ System Management Password by using the arrow keys.
4. Type the current supervisor password in the Enter Current Password field. Then, leave the Enter New Password field blank, and press Enter twice.
5. In the Changes have been saved window, press Enter.
6. Press F10 to save changes and exit the UEFI BIOS menu.

Please note that if you haven't set a supervisor password, you'll need to contact a Lenovo authorized service provider to have the system management password removed.

## Flask App
Created a web app using Flask for a demonstration of the RAG chat models.
![image](https://github.com/wwaihoe/RAG-chatbot/assets/91514179/4e0def7b-7915-4995-9e0d-234b6b6999d5)
UI was created with BootStrap.
Local database to store chat logs was implemented using SQLite.

### Running the app
Download the fine-tuned models into the Flask App directory and run the command flask init-db from the Flask App directory to initialise the SQL database. Then, use the command flask run to start the app.
