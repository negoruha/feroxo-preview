# Make Request alignment + Czech language fix (02.07)

Only two areas were changed:

1. **Make Request bottom action block** — aligned the Send Request button and privacy text to the approved Frame 154 spacing and vertical centre line.
2. **Czech translation runtime** — changed the language function declaration from `const` to `let` so the later Czech coverage mappings can be applied without a JavaScript runtime reassignment error. This restores translations registered after the initial language pass, including About, Contact, product details and shared page text.
