interface UserDataDTO {
    email: string;
    firstName: string;
    lastName: string;
    uuid: string;
    password?: string;
    userName: string; // Add the 'userName' property
}
export default UserDataDTO;