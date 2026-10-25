#import <AppKit/AppKit.h>
#import <PDFKit/PDFKit.h>
#include <stdint.h>
#include <math.h>

// Only in-memory, already validated report bytes enter this bridge. No URL, path or shell.
int gestao_print_report_pdf(const uint8_t *bytes, size_t length, void *window_pointer) {
    @autoreleasepool {
        @try {
            if (![NSThread isMainThread] || window_pointer == NULL) return -1;
            NSWindow *owner = (__bridge NSWindow *)window_pointer;
            NSData *data = [NSData dataWithBytes:bytes length:length];
            PDFDocument *document = [[PDFDocument alloc] initWithData:data];
            if (document == nil || document.isEncrypted || document.pageCount == 0) return -1;
            NSRect media = [[document pageAtIndex:0] boundsForBox:kPDFDisplayBoxMediaBox];
            if (!isfinite(media.size.width) || !isfinite(media.size.height) || media.size.width <= 0 || media.size.height <= 0) return -1;
            NSPrintInfo *info = [[NSPrintInfo sharedPrintInfo] copy];
            info.orientation = NSPaperOrientationPortrait;
            info.paperSize = media.size;
            info.topMargin = 0;
            info.bottomMargin = 0;
            info.leftMargin = 0;
            info.rightMargin = 0;
            NSPrintOperation *operation = [document printOperationForPrintInfo:info scalingMode:kPDFPrintPageScaleNone autoRotate:NO];
            if (operation == nil) return -1;
            operation.showsPrintPanel = YES;
            operation.showsProgressPanel = YES;
            operation.canSpawnSeparateThread = NO;
            [owner makeKeyAndOrderFront:nil];
            // SDK runOperation returns NO for either cancellation or system error. Do not
            // turn that ambiguous outcome into a claim that a job was printed/cancelled.
            return [operation runOperation] ? 1 : 0;
        } @catch (NSException *exception) {
            (void)exception;
            return -1;
        }
    }
}
