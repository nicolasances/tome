# Tome Processes and Architecture

The simple logic is that: 
1. A Knwoledge Base is provided to an LLM,
2. The LLM is asked to generate $N_Q$ questions on that KB. 
3. When the user writes an answer $a_i$ to a question $q_i$ ($i \in [1, N_Q] $), the LLM is asked to evaluate the answer $a_i$ based on the specific question $q_i$. 

To make sure that there are no problems with the context size, the Knowledge Base is split into:
* Topics *(e.g. Crusades)*
* Sections *(e.g. The first crusade)* 

> Over time, **sections could grow** and thus some restructuring could be made, transforming them into topics. 


## 1. Architecture
The architecture of Tome has only two components: 
* The `tome` webapp 
* The `toto-ms-tome-agent` microservice. This service is responsible for handling all of the quizes, including the scoring. It basically implements a BFF pattern.

## 2. Processes
The overall process works as described in the page [Q&A process](./qanda.md). 

### Running a Quiz
A generic quiz is run following these steps: 
1. The Quiz is started on a given topic. 
2. Questions are generated and saved for that Quiz. 
3. The user is presented questions one by one. 
4. Each answer is rated. 
5. The scores are averaged and constitute the Quiz's scores. 

#### Starting a Quiz
The following flow shows how a quiz is started. 

![](./drawings/startquiz.drawio.svg)

#### Answering a Question
When a user answers a question, the LLM is asked to **rate** the answer and **provide explanations** for the rating. <br>
Both the rating and explanations are saved and then returned to the `tome` app. <br>
The user is shown the rating and explanation and can move on to the next question.

![](./drawings/answerquestion.drawio.svg)