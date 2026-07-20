import * as ImagePicker from 'expo-image-picker';

export const pickImage = async (options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (!permission.granted) {
    throw new Error('Permission to access camera roll is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect ?? [16, 9],
    quality: options?.quality ?? 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
};

export const getImageFilename = (uri: string) => {
  return uri.split('/').pop() || 'image.jpg';
};

export const getImageType = (uri: string) => {
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  return `image/${ext}`;
};

export const createFormDataImage = (uri: string) => {
  const filename = getImageFilename(uri);
  const type = getImageType(uri);

  return {
    uri,
    name: filename,
    type,
  };
};