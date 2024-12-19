import React from 'react';
import Link from 'next/link';

const AdminCenterButton: React.FC = () => {
  return (
    <Link href="/admin" className="text-[#041E3A] hover:text-[#001122]">
      Manage
    </Link>
  );
};

export default AdminCenterButton;

