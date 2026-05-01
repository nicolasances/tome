# Agent instructions

## Documentation
- The README is just a brief description of the project and an Index (TOC)
- The `docs` folder contain all documentation except the README
- The `docs/capabilities` folder contains a more detailed description of the project's capabilities. Capabilities are described in their own file, when they are complex enough. 
- The `docs/specs` folder contains detailed specifications for capabilities. It gives implementation specifications for the project's capabilities at a granular level. It **does not** document **changes** to the project, only how things should be. It **does not show code** unless strictly necessary to understand a capability. 

## Components
- To show buttons on the UI, always prefer using `RoundButton` from the `toto-react` library. **Do not** invent your own button style.