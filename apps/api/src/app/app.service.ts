import { MediaItem } from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): MediaItem {
    return {
      filename: 'sample-photo',
      meta: {},
      availableFormats: [
        {
          format: {
            mimeType: 'image/jpeg',
            resolution: 'medium',
          },
          url: 'https://cdn.pixabay.com/photo/2021/07/26/22/04/sea-shell-6495338__340.jpg',
        },
      ],
    };
  }
}
