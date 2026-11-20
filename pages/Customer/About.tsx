import React from 'react';
import { MapPin, Award, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="bg-[#fdfbf7] min-h-screen">
      <div className="relative bg-[#201207] py-24 px-4 sm:px-6 lg:px-8 text-center border-b border-[#4d2c16] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/philippine-solihiya-pattern.svg')]"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#faede1] mb-6">
            Built in Valenzuela City
          </h1>
          <p className="text-xl text-[#d4bca7] mb-8 font-light">
            Reclaimed Palochina furniture from our workshop to your room, with 1:1 AR preview before you order.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
           <div>
              <h2 className="text-3xl font-bold text-[#341e10] mb-6 font-serif">Who We Are</h2>
              <p className="text-lg text-[#5a3821] mb-6 leading-relaxed">
                Beauteous Palochina builds solid wood furniture in Valenzuela City using reclaimed Palochina pine.
              </p>
              <p className="text-lg text-[#5a3821] mb-6 leading-relaxed">
                Before ordering, you can preview exact piece dimensions at 1:1 scale in your own room using Augmented Reality.
              </p>
              <div className="space-y-6">
                  <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#f5e6d3] rounded-lg text-[#8c572a] shrink-0">
                          <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                          <h3 className="font-bold text-[#341e10] text-lg">Workshop Location</h3>
                          <p className="text-[#6d4529]">Gen. T. de Leon, Valenzuela City<br/>Metro Manila</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#f5e6d3] rounded-lg text-[#8c572a] shrink-0">
                          <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                          <h3 className="font-bold text-[#341e10] text-lg">Our Specialty</h3>
                          <div className="text-[#6d4529]">
                            Custom Palochina and steel-frame furniture:
                            <ul className="list-disc list-inside mt-1 text-sm">
                                <li>Bed frames, dining sets, and storage racks</li>
                                <li>Reclaimed Palochina pine lumber</li>
                                <li>Direct workshop pricing</li>
                            </ul>
                          </div>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#f5e6d3] rounded-lg text-[#8c572a] shrink-0">
                          <Clock className="w-5 h-5" />
                      </div>
                      <div>
                          <h3 className="font-bold text-[#341e10] text-lg">Established 2020</h3>
                          <p className="text-[#6d4529]">
                             Started as a backyard workshop in 2020, building made-to-order Palochina pieces for homes across Metro Manila.
                          </p>
                      </div>
                  </div>
              </div>
           </div>
           <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80"
                alt="Palochina Furniture"
                className="w-full h-full object-cover"
              />
           </div>
        </div>
        <div className="py-8 border-t border-[#ebdcc8]">
            <div className="flex justify-between items-end mb-8 mt-8">
                <div>
                    <h2 className="text-3xl font-bold text-[#341e10] font-serif">Workshop Pieces</h2>
                    <p className="text-[#6d4529] mt-2">Recent Palochina builds from our Valenzuela workshop.</p>
                </div>
                <Link to="/" className="text-[#8c572a] font-bold hover:underline flex items-center gap-2">
                    Explore Shop <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="group relative overflow-hidden rounded-xl aspect-[4/3]">
                    <img src="https://i.ytimg.com/vi/hbsNo-u_pHg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAklslzmtLeq8m1fGLiSoMpty36Mw" alt="Palochina Bed Frame" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                </div>
                <div className="group relative overflow-hidden rounded-xl aspect-[4/3]">
                    <img src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80" alt="Multi-Purpose Rack" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                </div>
                <div className="group relative overflow-hidden rounded-xl aspect-[4/3]">
                    <img src="https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=800&q=80" alt="Palochina Dining Set" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
