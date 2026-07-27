// Consolidated SVG icon set. All 24×24 by default, current color.

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
});

export function MenuIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlayIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

export function PauseIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function SkipBackIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 5v14L9 12l10-7zM6 5h2v14H6V5z" />
    </svg>
  );
}

export function SkipForwardIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p} fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 5v14l10-7L5 5zm11 0h2v14h-2V5z" />
    </svg>
  );
}

export function DownloadIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TranscriptIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 8h8M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ExternalLinkIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d="M14 4h6v6M20 4L10 14M18 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BookmarkIcon({ size = 24, filled = false, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function PlusIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MinusIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 24, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LightbulbIcon({ size = 40, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...p}>
      {/* Rays */}
      <path d="M20 4v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M28.5 6.5l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M32 15h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11.5 6.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 15h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bulb */}
      <path
        d="M20 10c-4 0-7 3-7 7.5 0 2.5 1 4.5 3 5.8V26c0 1 1 2 2 2h4c1 0 2-1 2-2v-2.7c2-1.3 3-3.3 3-5.8C27 13 24 10 20 10z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Base */}
      <path d="M17 29h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 31h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M19 33h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function CompassIcon({ size = 40, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...p}>
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M25.5 14.5L23 22l-7.5 3.5L18 18l7.5-3.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TargetIcon({ size = 40, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...p}>
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="20" cy="20" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="20" cy="20" r="3.5" fill="currentColor" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...p}>
      <rect width="40" height="40" rx="20" fill="#F5F5F5" fillOpacity="0.15" />
      <g transform="translate(20,20) scale(1.4) translate(-20,-20)">
        <path d="M25.5 14.5H25.51M15 10H25C27.7614 10 30 12.2386 30 15V25C30 27.7614 27.7614 30 25 30H15C12.2386 30 10 27.7614 10 25V15C10 12.2386 12.2386 10 15 10ZM24 19.37C24.1234 20.2022 23.9813 21.0522 23.5938 21.799C23.2063 22.5458 22.5931 23.1514 21.8416 23.5297C21.0901 23.9079 20.2384 24.0396 19.4078 23.9059C18.5771 23.7723 17.8098 23.3801 17.2148 22.7852C16.6199 22.1902 16.2277 21.4229 16.0941 20.5922C15.9604 19.7616 16.0921 18.9099 16.4703 18.1584C16.8486 17.4069 17.4542 16.7937 18.201 16.4062C18.9478 16.0187 19.7978 15.8766 20.63 16C21.4789 16.1259 22.2649 16.5215 22.8717 17.1283C23.4785 17.7352 23.8741 18.5211 24 19.37Z" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function XIcon({ size = 20, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export function TelegramIcon({ size = 20, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...p}>
      <rect width="40" height="40" rx="20" fill="#F5F5F5" fillOpacity="0.15" />
      <g transform="translate(20,20) scale(1.2) translate(-20,-20)">
        <path d="M30.4828 10.1206C30.9363 10.0397 31.5088 10.0604 31.7994 10.4759C32.1108 10.9482 31.9805 11.5408 31.9267 12.0664C31.6163 14.3378 31.2492 16.6008 30.9052 18.8678C30.4019 22.0245 29.9006 25.1816 29.3962 28.3378C29.3128 28.8412 29.1298 29.38 28.6935 29.6845C28.2588 29.985 27.6898 29.9515 27.2028 29.8182C26.4932 29.6149 25.8438 29.2458 25.2388 28.8293C23.3577 27.5754 21.4451 26.365 19.6336 25.0094C19.333 24.7686 19.0073 24.552 18.7532 24.2594C18.5578 24.026 18.4325 23.7156 18.4828 23.4076C18.5381 23.0578 18.7754 22.7726 19.0305 22.5416C21.1608 20.5771 23.2689 18.5875 25.3286 16.549C25.6573 16.2366 25.9578 15.872 26.1024 15.4362C26.1473 15.3055 26.1621 15.1012 26.0012 15.0464C25.7994 14.9931 25.5946 15.0795 25.4071 15.1485C24.8539 15.3869 24.3501 15.7215 23.8497 16.0531C21.0093 17.9697 18.1655 19.8814 15.3256 21.798C15.0601 21.9756 14.7423 22.0546 14.431 22.1059C13.7682 22.2031 13.0912 22.1123 12.4522 21.9258C11.1642 21.5335 9.88271 21.1209 8.60859 20.6877C8.29623 20.6132 8.04802 20.324 8.00212 20.0092C7.974 19.6805 8.23011 19.42 8.47536 19.2403C8.81387 18.9936 9.20322 18.8303 9.59058 18.6778C16.2775 15.9287 22.9565 13.1599 29.6366 10.3945C29.9085 10.2746 30.1882 10.1685 30.4828 10.1206Z" fill="#A1A1AA" />
      </g>
    </svg>
  );
}

export function CastboxIcon({ size = 20, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...p}>
      <rect width="40" height="40" rx="20" fill="#F5F5F5" fillOpacity="0.15" />
      <g transform="translate(20,20) scale(1.3) translate(-20,-20)">
        <path fillRule="evenodd" clipRule="evenodd" d="M19.0614 6.37376C19.5978 6.0564 20.4027 6.0564 20.9391 6.37376L31.0714 12.3656C31.6024 12.6797 32 13.3756 32 13.9919V26.0064C32 26.6227 31.6024 27.3186 31.0714 27.6327L20.9391 33.6256C20.4027 33.9429 19.5984 33.9429 19.0614 33.6256L8.92856 27.6327C8.39757 27.3186 8 26.6227 8 26.0064V13.9919C8 13.3756 8.39757 12.6797 8.92856 12.3656L19.0614 6.37376ZM21.654 16.411C21.1995 16.411 20.8307 16.7603 20.8307 17.1914V19.0804C20.8307 19.3192 20.6094 19.5125 20.3365 19.5125C20.0637 19.5125 19.8424 19.3192 19.8424 19.0804V16.5107C19.8424 16.079 19.4736 15.7297 19.0191 15.7297C18.564 15.7297 18.1958 16.079 18.1958 16.5107V18.5702C18.1958 18.8085 17.9745 19.0024 17.7016 19.0024C17.4294 19.0024 17.2081 18.8085 17.2081 18.5702V17.8239C17.2081 17.3929 16.8393 17.043 16.3847 17.043C15.9297 17.043 15.5614 17.3923 15.5614 17.8239V19.5911C15.5614 19.8293 15.3401 20.0232 15.0673 20.0232C14.795 20.0232 14.5737 19.8293 14.5737 19.5911V19.3858C14.5737 18.9347 14.2049 18.5686 13.7504 18.5686C13.2953 18.5686 12.927 18.9347 12.927 19.3858V21.8385C12.927 22.2896 13.2953 22.6563 13.7504 22.6563C14.2049 22.6563 14.5737 22.2902 14.5737 21.8385V21.6333C14.5737 21.395 14.795 21.2011 15.0673 21.2011C15.3401 21.2011 15.5614 21.395 15.5614 21.6333V24.4369C15.5614 24.868 15.9297 25.2178 16.3847 25.2178C16.8393 25.2178 17.2081 24.868 17.2081 24.4369V20.6124C17.2081 20.3741 17.4294 20.1803 17.7016 20.1803C17.9745 20.1803 18.1958 20.3741 18.1958 20.6124V22.5393C18.1958 22.9709 18.564 23.3202 19.0191 23.3202C19.4736 23.3202 19.8424 22.9709 19.8424 22.5393V21.1226C19.8424 20.8843 20.0637 20.6904 20.3365 20.6904C20.6088 20.6904 20.8307 20.8843 20.8307 21.1226V22.6368C20.8307 23.0679 21.1995 23.4177 21.654 23.4177C22.1091 23.4177 22.4773 23.0684 22.4773 22.6368V17.1914C22.4773 16.7603 22.1091 16.411 21.654 16.411ZM24.2889 18.5204C23.8344 18.5204 23.4656 18.8697 23.4656 19.3013V22.4109C23.4656 22.842 23.8338 23.1919 24.2889 23.1919C24.7434 23.1919 25.1123 22.8426 25.1123 22.4109V19.3013C25.1117 18.8697 24.7429 18.5204 24.2889 18.5204ZM26.9233 20.1017C26.4688 20.1017 26.0999 20.451 26.0999 20.8827V21.6566C26.0999 22.0876 26.4688 22.4375 26.9233 22.4375C27.3783 22.4375 27.7466 22.0882 27.7466 21.6566V20.8827C27.7466 20.451 27.3783 20.1017 26.9233 20.1017Z" fill="#A1A1AA" />
      </g>
    </svg>
  );
}

export function AnchorIcon({ size = 20, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...p}>
      <rect width="40" height="40" rx="20" fill="#F5F5F5" fillOpacity="0.15" />
      <g transform="translate(20,20) scale(1.2) translate(-20,-20)">
        <path d="M19.8163 5.71289H20.1774C22.1804 5.74638 24.1751 6.27881 25.9147 7.27614C27.579 8.21989 29.0105 9.56939 30.0547 11.1723C31.0515 12.6959 31.6939 14.4511 31.9104 16.2594C32.1705 18.3472 31.8607 20.501 31.028 22.4331C30.2171 24.3312 28.9073 26.0134 27.2614 27.2596C27.0973 27.3841 26.921 27.5375 26.6994 27.5191C26.4114 27.5141 26.1575 27.2641 26.1502 26.9755C26.1335 26.7573 26.2669 26.5597 26.4438 26.4437C27.675 25.539 28.7086 24.3686 29.4575 23.037C30.7629 20.7387 31.1804 17.9566 30.6022 15.377C30.1769 13.4303 29.1947 11.612 27.8095 10.1805C26.4058 8.71995 24.5859 7.6629 22.618 7.17624C20.7606 6.7158 18.7799 6.75431 16.9443 7.29679C14.6087 7.976 12.5264 9.47618 11.1278 11.4647C9.90607 13.1842 9.20733 15.2687 9.14929 17.3773C9.08343 19.2631 9.53494 21.1612 10.4251 22.8238C11.1819 24.243 12.2585 25.4926 13.5577 26.4425C13.7146 26.5508 13.8424 26.7182 13.8485 26.9158C13.8742 27.2228 13.6119 27.5141 13.3038 27.5186C13.0532 27.537 12.8635 27.3506 12.6776 27.2122C10.8532 25.8152 9.45345 23.878 8.68829 21.7126C7.99122 19.7592 7.82044 17.6239 8.19046 15.5835C8.56886 13.4521 9.54945 11.4335 10.9799 9.80937C12.1396 8.48722 13.5907 7.41901 15.2036 6.71692C16.6541 6.07733 18.233 5.74359 19.8163 5.71289Z" fill="#A1A1AA" />
        <path d="M19.1925 10.3298C20.624 10.1735 22.1013 10.4386 23.3816 11.1011C24.7981 11.826 25.9701 13.0165 26.6694 14.4463C27.3787 15.8795 27.5981 17.546 27.2967 19.1154C27.088 20.2149 26.6192 21.2641 25.9388 22.1526C25.7474 22.416 25.3249 22.4534 25.0944 22.2218C24.8701 22.0209 24.86 21.6503 25.0554 21.426C25.969 20.2188 26.4009 18.6673 26.2609 17.1615C26.1286 15.5726 25.3539 14.0534 24.1563 13.0036C23.0814 12.047 21.6688 11.4794 20.23 11.4337C18.8649 11.3784 17.4875 11.7898 16.3752 12.5828C15.0452 13.5188 14.0992 14.986 13.8157 16.5889C13.5037 18.2654 13.9089 20.0664 14.9448 21.4254C15.1379 21.6498 15.1301 22.0176 14.9079 22.219C14.6869 22.4417 14.2829 22.4239 14.0847 22.1805C13.0623 20.8734 12.5287 19.2019 12.5739 17.5455C12.6035 15.9192 13.1962 14.3118 14.222 13.0505C15.4359 11.5375 17.262 10.5329 19.1925 10.3298Z" fill="#A1A1AA" />
        <path d="M19.6748 14.8768C20.3407 14.8003 21.0322 14.9638 21.5875 15.3411C22.255 15.7848 22.7199 16.5204 22.827 17.3157C22.9325 18.044 22.7405 18.8092 22.303 19.4002C21.8743 19.9884 21.2141 20.4037 20.4958 20.5259C19.7898 20.6526 19.0375 20.5002 18.4386 20.1034C17.7561 19.6614 17.2789 18.9158 17.1712 18.1082C17.0674 17.381 17.2588 16.6164 17.6975 16.0265C18.1596 15.3908 18.8935 14.9633 19.6748 14.8768Z" fill="#A1A1AA" />
        <path d="M18.3355 21.8769C19.8508 21.5889 21.4553 21.6793 22.9019 22.2313C23.7078 22.5527 24.526 23.0271 24.9507 23.8152C25.1796 24.2164 25.1489 24.6891 25.1338 25.1328C25.0847 26.7619 24.824 28.3832 24.3686 29.9476C24.0728 30.9338 23.7106 31.9071 23.2067 32.8079C22.9817 33.1952 22.7362 33.6065 22.3243 33.8197C21.6563 34.1803 20.8822 34.2629 20.1354 34.288H19.8714C19.1894 34.2673 18.4952 34.1875 17.8634 33.9152C17.4013 33.7343 17.0876 33.3303 16.8521 32.9106C16.5044 32.3162 16.2304 31.6816 15.9904 31.037C15.2392 28.972 14.8597 26.7731 14.8574 24.5764C14.8541 23.924 15.2783 23.3603 15.7694 22.9719C16.5117 22.392 17.4197 22.0627 18.3355 21.8769Z" fill="#A1A1AA" />
      </g>
    </svg>
  );
}

export function StarIcon({ size = 14, filled = true, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
