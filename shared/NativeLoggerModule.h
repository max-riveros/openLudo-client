#pragma once

#include <ClientSpecsJSI.h>
#include <ReactCommon/CallInvoker.h>

#include <memory>
#include <functional>
#include <string>

namespace facebook::react {

class NativeLoggerModule : public NativeLoggerModuleCxxSpec<NativeLoggerModule> {
  std::shared_ptr<jsi::Function> callback_;
public:
  NativeLoggerModule(std::shared_ptr<CallInvoker> jsInvoker);

  void registerLog(jsi::Runtime& rt, jsi::Function callback);

  void log(jsi::Runtime& rt, std::string message);
};

}