import { TrendingUp, TrendingDown, ArrowLeftRight, Circle } from 'lucide-react';


// Format date as "Month Day" (e.g., "June 5")
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

export const getTypeIcon = (type) => {
    switch(type) {
      case 'inbound':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'outbound':
        return <TrendingUp size={16} className="text-red-500 transform rotate-180" />;
      case 'transfer':
        return <ArrowRightLeft size={16} className="text-blue-500" />;
      default:
        return <Circle size={16} />;
    }
  };
  