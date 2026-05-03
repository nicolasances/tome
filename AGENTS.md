# Agent instructions

## Documentation
- The README is just a brief description of the project and an Index (TOC)
- The `docs` folder contain all documentation except the README
- The `docs/capabilities` folder contains a more detailed description of the project's capabilities. Capabilities are described in their own file, when they are complex enough. 
- The `docs/specs` folder contains detailed specifications for capabilities. It gives implementation specifications for the project's capabilities at a granular level. It **does not** document **changes** to the project, only how things should be. It **does not show code** unless strictly necessary to understand a capability. 

## Style guide for front-end development
### Buttons
- For buttons always use `RoundButton` from the `toto-react` library. **Do not** invent your own button style.

### APIs
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