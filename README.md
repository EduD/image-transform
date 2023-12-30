# Image Transform
Resizes a list of images and adds a watermark to each of them.

### Motivation to Create

### How to Use
1. Clone this repository to your local machine.
2. Install the necessary dependencies: `npm ci`
2. Add your images to the `./input` directory (the water mark should be `water-mark.png`).
3. Run the application using the command: `npm run start`
4. View the resulting images in the `./output` directory.

### Todo
- [ ] Add tests
- [ ] Enable receiving values via cli arguments
- [ ] Add an option "colorOverlay"
- [ ] Add an option "opacity"
 
### Technologies Used
- [Node v20.10.0](https://nodejs.org)
- [Node.js Streams](https://nodejs.org/api/stream.html)
- [Sharp v0.33.0](https://www.npmjs.com/package/sharp)

### Contributing

Feel free to contribute by opening issues or submitting pull requests. Your feedback and contributions are highly appreciated.

### License
This project is licensed under the MIT License - see the LICENSE file for details.
