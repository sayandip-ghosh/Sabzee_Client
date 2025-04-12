import { Link } from 'react-router-dom';
import TranslateText from '../components/TranslateText';

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  const { 
    _id = '', 
    name = 'Unnamed Product', 
    description = 'No description available', 
    price = 0, 
    unit = 'unit', 
    images = [], 
    farmer = {}, 
    organic = false, 
    quantity = 0, 
    status = 'available' 
  } = product;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 bg-gray-200">
        {images && images.length > 0 && images[0]?.url ? (
          <img 
            src={images[0].url} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400"><TranslateText>No image</TranslateText></span>
          </div>
        )}
        {organic && (
          <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            <TranslateText>Organic</TranslateText>
          </span>
        )}
        {status !== 'available' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg uppercase">
              <TranslateText>{status === 'sold_out' ? 'Sold Out' : 'Coming Soon'}</TranslateText>
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 mb-1"><TranslateText>{name}</TranslateText></h3>
          <p className="text-green-600 font-bold">₹{price}/<TranslateText>{unit}</TranslateText></p>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2"><TranslateText>{description}</TranslateText></p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <TranslateText>Available: {quantity} {unit}</TranslateText>
          </div>
          <Link 
            to={`/products/${_id}`}
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm transition-colors duration-300"
          >
            <TranslateText>View Details</TranslateText>
          </Link>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link 
            to={farmer._id ? `/farmers/${farmer._id}` : '#'} 
            className={`text-sm text-gray-600 ${farmer._id ? 'hover:text-green-600' : ''}`}
          >
            <TranslateText>By: </TranslateText>{farmer.name || <TranslateText>Unknown Farmer</TranslateText>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 