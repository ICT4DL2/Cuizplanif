import React, { useState } from 'react';
import { Image, ImageProps } from 'react-native';

interface FallbackImageProps extends ImageProps {
  fallbackSource: any;
}

const FallbackImage: React.FC<FallbackImageProps> = ({ fallbackSource, ...props }) => {
  const [error, setError] = useState(false);

  return (
    <Image
      {...props}
      source={error ? fallbackSource : props.source}
      onError={() => setError(true)}
    />
  );
};

export default FallbackImage;
