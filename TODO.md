# Resume Builder - Bullet Points Feature

## Task
When user completes a sentence and hits Enter in description boxes (Summary, Work Experience, Internships, Projects), convert text to bullet point format.

## Implementation Steps

- [ ] 1. Add `convertToBulletPoints` helper function to transform sentences to bullet points
- [ ] 2. Update Summary tab - Add onKeyDown handler to professional summary textarea
- [ ] 3. Update Work Experience tab - Add onKeyDown handler to description textarea
- [ ] 4. Update Internships tab - Add onKeyDown handler to description textarea
- [ ] 5. Update Projects tab - Add onKeyDown handler to description textarea

## Helper Function Logic
- Detect Enter key (without Shift modifier)
- Split current text by sentences (period, exclamation, question mark followed by space)
- Convert each sentence to bullet point format: "• sentence"
- Join with newlines
