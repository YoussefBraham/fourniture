import React, { useState, useEffect } from 'react';

const RenderColorQuantities =  ({ initialColorCounts, onColorsArrayChange }) => {
  const [colorCounts, setColorCounts] = useState(initialColorCounts);

  useEffect(() => {
    setColorCounts(initialColorCounts);
  }, [initialColorCounts]);

  const handleChange = (color) => (event) => {
    const newCount = parseInt(event.target.value, 10);

    if (!isNaN(newCount) && newCount >= 0) {
      const updatedColorCounts = {
        ...colorCounts,
        [color]: newCount,
      };

      setColorCounts(updatedColorCounts);

      const colorsArray = Object.entries(updatedColorCounts)
        .reduce((acc, [color, count]) => acc.concat(Array(count).fill(color)), [])
        .join(', ');

      console.log('Updated colors string:', colorsArray);
      onColorsArrayChange(colorsArray);

    }
  };

  return (
    <>
      {Object.entries(colorCounts).map(([color, count]) => (
        <div className='flex flex-col m-2 text-xl' key={color}>
          <div className='flex items-center justify-center h-3/4'>
            <span className='w-1/2'>{color}: </span>
            <input
              type='number'
              value={count}
              min='0'
              onChange={handleChange(color)}
              className=' w-1/5 border p-1 rounded-full flex items-center justify-center'
              style={{
                MozAppearance: 'textfield', /* Firefox */
                width: '20%', /* Adjust width to fit container */
                textAlign: 'center', /* Center text */
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default RenderColorQuantities;
