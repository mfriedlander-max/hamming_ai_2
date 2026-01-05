### New console messages
- ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3002/_next/static/chunks...
- [ERROR] Warning: An error occurred during hydration. The server HTML was replaced with client conten...
- ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3002/_next/static/chunks...
- ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3002/_next/static/chunks...
- ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3002/_next/static/chunks...
- [ERROR] The above error occurred in the <NotFoundErrorBoundary> component:

    at Lazy
    at body
...
- Error: There was an error while hydrating. Because the error happened outside of a Suspense boundary...

### Page state
- Page URL: http://localhost:3002/
- Page Title: 
- Page Snapshot:
```yaml
- dialog "Unhandled Runtime Error" [ref=e158]:
  - generic [ref=e159]:
    - generic [ref=e160]:
      - generic [ref=e161]:
        - navigation [ref=e162]:
          - button "previous" [disabled] [ref=e163]:
            - img "previous" [ref=e164]
          - button "next" [disabled] [ref=e166]:
            - img "next" [ref=e167]
          - generic [ref=e169]: 1 of 1 error
          - generic [ref=e170]:
            - text: Next.js (14.2.35) is outdated
            - link "(learn more)" [ref=e172] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - button "Close" [ref=e173] [cursor=pointer]:
          - img [ref=e175]
      - heading "Unhandled Runtime Error" [level=1] [ref=e178]
      - paragraph [ref=e179]: "ChunkLoadError: Loading chunk app/layout failed. (timeout: http://localhost:3002/_next/static/chunks/app/layout.js)"
    - generic [ref=e180]:
      - heading "Call Stack" [level=2] [ref=e181]
      - group [ref=e182]:
        - generic "Next.js" [ref=e183] [cursor=pointer]:
          - img [ref=e184]
          - img [ref=e186]
          - text: Next.js
      - generic [ref=e191]:
        - heading "<unknown>" [level=3] [ref=e192]
        - generic [ref=e194]: file:///Users/maxfriedlander/code/hamming_project_2/app/.next/static/chunks/webpack.js (155:40)
      - generic [ref=e195]:
        - heading "Array.reduce" [level=3] [ref=e196]
        - generic [ref=e198]: <anonymous>
      - group [ref=e199]:
        - generic "Next.js" [ref=e200] [cursor=pointer]:
          - img [ref=e201]
          - img [ref=e203]
          - text: Next.js
      - generic [ref=e208]:
        - heading "fn.e" [level=3] [ref=e209]
        - generic [ref=e211]: file:///Users/maxfriedlander/code/hamming_project_2/app/.next/static/chunks/webpack.js (391:50)
      - group [ref=e212]:
        - generic "React" [ref=e213] [cursor=pointer]:
          - img [ref=e214]
          - img [ref=e216]
          - text: React
```
