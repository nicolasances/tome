# How is the Q&A working? 

The simple logic is that: 
1. A Knwoledge Base is provided to an LLM,
2. The LLM is asked to generate $N_Q$ questions on that KB. 
3. When the user writes an answer $a_i$ to a question $q_i$ ($i \in [1, N_Q] $), the LLM is asked to evaluate the answer $a_i$ based on the specific question $q_i$. 

To make sure that there are no problems with the context size, the Knowledge Base is split into:
* Topics *(e.g. Crusades)*
* Sections *(e.g. The first crusade)* 

> Over time, **sections could grow** and thus some restructuring could be made, transforming them into topics. 

