interface ChevronRightIconProps extends React.SVGProps<SVGSVGElement> { }

const ChevronRightIcon: React.FC<ChevronRightIconProps> = (props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-chevron-first"
   >
      <path d="m17 18-6-6 6-6"></path>
      <path d="M7 6v12"></path>
   </svg>
);

export default ChevronRightIcon;
