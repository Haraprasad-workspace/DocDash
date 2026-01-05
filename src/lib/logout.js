import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export async function logout() {
  console.log('smee')
  await signOut(auth);
  console.log("idfkkk")
}
