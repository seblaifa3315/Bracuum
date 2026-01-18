import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { Navbar1 } from "@/components/public/Navbar1";
import { Navbar2 } from "@/components/public/Navbar2";


export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar2 />
      {children}
    </div>
  );
}
