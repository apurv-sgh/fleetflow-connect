import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const GovFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg">About GFAMS</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Government Fleet Allocation & Management System - An integrated web-based solution for 
              efficient vehicle allocation and fleet management at NIC's Transport Division.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.nic.in" target="_blank" rel="noopener noreferrer" 
                   className="hover:text-secondary transition-colors inline-flex items-center gap-1">
                  NIC Official Website <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://www.meity.gov.in" target="_blank" rel="noopener noreferrer"
                   className="hover:text-secondary transition-colors inline-flex items-center gap-1">
                  MeitY Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer"
                   className="hover:text-secondary transition-colors inline-flex items-center gap-1">
                  National Portal of India <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-primary-foreground/80">
                  A-Block, CGO Complex, Lodhi Road,<br />New Delhi - 110003
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="text-primary-foreground/80">+91-11-24305000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-primary-foreground/80">transport@nic.in</span>
              </li>
            </ul>
          </div>

          {/* Helpdesk */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg">Support</h3>
            <div className="bg-primary-foreground/10 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">24x7 Helpdesk</p>
              <p className="text-2xl font-bold text-secondary">1800-111-555</p>
              <p className="text-xs text-primary-foreground/70">(Toll Free)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/70">
            <p>
              © {new Date().getFullYear()} National Informatics Centre. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Use</a>
              <span className="text-primary-foreground/30">|</span>
              <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
              <span className="text-primary-foreground/30">|</span>
              <a href="#" className="hover:text-primary-foreground transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>

      {/* Tricolor Strip */}
      <div className="gov-header-strip" />
    </footer>
  );
};

export default GovFooter;
