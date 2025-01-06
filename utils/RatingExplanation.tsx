'use client'

export function FormattedRatingExplanation({ explanation }: { explanation: string }) {

  // Split the string into sentences based on '.' and filter out empty strings (e.g., trailing periods)
  let processedExplanation = explanation.replace(/e\.g\./g, 'eg');
  const sentences = processedExplanation.split('.').map(sentence => sentence.trim()).filter(Boolean);

  // Return a React component
  return (
    <div className="flex flex-col space-y-2">
      {sentences.map((sentence, index) => (
        <div key={index} className="text-lg">
          {sentence.replace(/eg\,/g, 'e.g.')}.
        </div>
      ))}
    </div>
  );
}


export function FormattedDetailedRatingExplanation({ text }: { text: string }) {

  // Function to format the text
  const formatText = (input: string) => {
    return input.split('\n').map((line, index) => {
      const trimmedLine = line.trim();

      if (/^\d+\./.test(trimmedLine)) {
        // Headings based on numbered lists
        return (
          <div key={index} className="font-bold text-cyan-200">
            {trimmedLine}
          </div>
        );
      } else if (/^-/.test(trimmedLine)) {
        // Bulleted list items
        return (
          <li key={index} style={{ marginLeft: '1.5em' }}>
            {trimmedLine.substring(1).trim()}
          </li>
        );
      } else if (trimmedLine) {
        // General text as paragraphs
        return (
          <div key={index}>
            {trimmedLine}
          </div>
        );
      } else {
        // Empty lines
        return <br key={index} />;
      }
    });
  };

  return <div className="">{formatText(text)}</div>;
};
