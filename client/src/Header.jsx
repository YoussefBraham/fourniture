
import {Link} from "react-router-dom";

export default function Header() {

  return (
    <div>
      <header className="p-1 fixed top-0 left-0 right-0 flex justify-between items-center py-0.5 shadow-md min-h-50vh bg-gray-100 z-50">
        <div></div>
        <Link to={'/'}><div>Fourniture.tn</div></Link>
            <div className="flex floc-row ">
            <Link to={'/panier'} ><div className="m-3">panier</div></Link>
            <Link to={'/compte'} ><div className="m-3">compte</div></Link>
              
            </div>
      </header>
    </div>
  );
}
