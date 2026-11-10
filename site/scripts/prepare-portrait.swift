import AppKit
import CoreImage
import Vision

guard CommandLine.arguments.count == 3 else {
    fatalError("Usage: swift scripts/prepare-portrait.swift <source.png> <output.png>")
}

let sourceURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
guard let sourceImage = CIImage(contentsOf: sourceURL) else {
    fatalError("Cannot load the source portrait.")
}

let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(url: sourceURL, options: [:]).perform([request])
guard let observation = request.results?.first else {
    fatalError("No person mask was generated.")
}

let rawMask = CIImage(cvPixelBuffer: observation.pixelBuffer)
let scaledMask = rawMask.transformed(by: CGAffineTransform(
    scaleX: sourceImage.extent.width / rawMask.extent.width,
    y: sourceImage.extent.height / rawMask.extent.height
))
let bottomFade = CIFilter(name: "CILinearGradient", parameters: [
    "inputPoint0": CIVector(x: 0, y: 0),
    "inputPoint1": CIVector(x: 0, y: sourceImage.extent.height * 0.13),
    "inputColor0": CIColor.black,
    "inputColor1": CIColor.white,
])!.outputImage!.cropped(to: sourceImage.extent)
let mask = scaledMask.applyingFilter("CIMultiplyCompositing", parameters: [
    kCIInputBackgroundImageKey: bottomFade,
])
let portrait = sourceImage.applyingFilter("CIBlendWithMask", parameters: [
    kCIInputBackgroundImageKey: CIImage(color: .clear).cropped(to: sourceImage.extent),
    kCIInputMaskImageKey: mask,
])

try FileManager.default.createDirectory(at: outputURL.deletingLastPathComponent(), withIntermediateDirectories: true)
try CIContext().writePNGRepresentation(of: portrait, to: outputURL, format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
print("Prepared transparent portrait: \(outputURL.lastPathComponent)")