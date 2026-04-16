#include "NativeLoggerModule.h"

#include "LudoClient.h"

namespace facebook::react {

NativeLoggerModule::NativeLoggerModule(std::shared_ptr<CallInvoker> jsInvoker) 
        : NativeLoggerModuleCxxSpec(std::move(jsInvoker)) {}

void NativeLoggerModule::registerLog(jsi::Runtime& rt, jsi::Function callback) {
    callback_ = std::make_shared<jsi::Function>(std::move(callback));
    LudoClient::create(this);
}

void NativeLoggerModule::log(jsi::Runtime& rt, std::string message) {
    callback_->call(rt, jsi::String::createFromUtf8(rt, message));
}

}