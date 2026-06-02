const mongoose = require('mongoose');
const Store = require('../models/Store');
const connectDB = require('../config/db');

// Sample store data
const storeData = [
  {
    name: 'LemonHub Quận 1',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '028 1234 5678',
    hours: '8:00 - 21:00',
    image: '/uploads/stores/store-district-1.jpg',
    location: {
      latitude: 10.772,
      longitude: 106.698
    },
    city: 'Hồ Chí Minh',
    isActive: true
  },
  {
    name: 'LemonHub Quận 3',
    address: '456 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh',
    phone: '028 2345 6789',
    hours: '8:00 - 21:00',
    image: '/uploads/stores/store-district-3.jpg',
    location: {
      latitude: 10.780,
      longitude: 106.680
    },
    city: 'Hồ Chí Minh',
    isActive: true
  },
  {
    name: 'LemonHub Quận 7',
    address: '789 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh',
    phone: '028 3456 7890',
    hours: '8:00 - 21:00',
    image: '/uploads/stores/store-district-7.jpg',
    location: {
      latitude: 10.729,
      longitude: 106.717
    },
    city: 'Hồ Chí Minh',
    isActive: true
  },
  {
    name: 'LemonHub Quận Cầu Giấy',
    address: '123 Xuân Thủy, Cầu Giấy, Hà Nội',
    phone: '024 1234 5678',
    hours: '8:00 - 21:00',
    image: '/uploads/stores/store-hanoi-1.jpg',
    location: {
      latitude: 21.037,
      longitude: 105.782
    },
    city: 'Hà Nội',
    isActive: true
  },
  {
    name: 'LemonHub Quận Hoàn Kiếm',
    address: '456 Hàng Bài, Hoàn Kiếm, Hà Nội',
    phone: '024 2345 6789',
    hours: '8:00 - 21:00',
    image: '/uploads/stores/store-hanoi-2.jpg',
    location: {
      latitude: 21.025,
      longitude: 105.853
    },
    city: 'Hà Nội',
    isActive: true
  },
  {
    name: 'LemonHub Đà Nẵng',
    address: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    phone: '0236 1234 5678',
    hours: '8:00 - 21:00',
    image: '/uploads/stores/store-danang.jpg',
    location: {
      latitude: 16.060,
      longitude: 108.223
    },
    city: 'Đà Nẵng',
    isActive: true
  }
];

// Function to seed stores
const seedStores = async () => {
  try {
    // Connect to database
    await connectDB();

    // Delete existing stores
    await Store.deleteMany({});
    console.log('Stores cleared');

    // Insert new stores
    await Store.insertMany(storeData);
    console.log('Stores seeded successfully');

    // Exit process
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedStores();