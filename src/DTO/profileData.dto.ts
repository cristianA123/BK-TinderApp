interface ProfileDataDTO {
    email: string;
    firstName: string;
    lastName: string;
    uuid: string;
    password?: string;
    userName: string;
    lastLogin?: Date;
}
export default ProfileDataDTO;