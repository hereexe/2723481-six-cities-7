import {User} from '../../../../types/user.type.js';

export type UpdateUserDto = Pick<User, 'avatarPath'>;
