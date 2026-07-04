# Agent instructions

## Communication to the user
- Whenever using a skill, **always** tell the user what model you're using.

## Documentation

Based on the work that you need to do, you must pay particular attention to specific documents: 

- Whenever you are tasked **to ideate, create, document features**, you **must** read the architecture design file stored in `docs/architecture/architecture.md`
- Whenever you are implementing a feature, you **must** have a good understanding of the idea for the app. For Language Learning this idea is described in `docs/idea/language-learning/idea.md`
- Whenever you are implementing a feature, the user **must** have given you a reference to the feature file that needs to be implemented. If you do not have this **you cannot proceed**: ask the user for the feature description file. 

This project contains UI design (wireframes) files: 
- for **Language Learning**: `docs/ui-design/tome-language-learning` contains all the UI design. If you are tasked to implement a UI component, you **MUST** check it as a reference (source of truth) for what the Language Learning UI should look like.

---

## Style guide for front-end development

- You **must** always check the repo `nicolasances/sdlc-agent-specs` for the file called `coding-standards/frontend-coding-standards.md` before you start any UI development. 

---

## APIs integration

All Backend APIs used must be wrapped by an API class in the `/api` folder. <br>
Example: 
```
export class TomeLanguageAPI {

    /**
     * Fetches the vocabulary for the specified language
     */
    async getVocabulary(language: string): Promise<GetVocabularyResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/vocabulary/${language}`)).json();
    }
}
```

Important rules: 
- The path **must not** include the basepath of the microservice. The basepath needs to be in the Config file, so contained in the `NEXT_PUBLIC_<..>_API_ENDPOINT` that corresponds to the microservice. In the above example its `/vocabulary/${language}` not `/tomelang/vocabulary/${language}` as `/tomelang` is the basepath of the microservice.